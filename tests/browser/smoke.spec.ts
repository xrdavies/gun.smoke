import { expect, test, type Page } from "@playwright/test";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

async function runPistolWithClock(page: Page, duration: number, keys: readonly string[] = ["z", "x"]): Promise<void> {
  for (let elapsed = 0; elapsed < duration; elapsed += 120) {
    const burst = Math.min(32, duration - elapsed);
    for (const key of keys) await page.keyboard.down(key);
    await page.clock.runFor(burst);
    for (const key of keys) await page.keyboard.up(key);
    if (duration - elapsed > burst) await page.clock.runFor(Math.min(120 - burst, duration - elapsed - burst));
  }
}

async function waitForBossProjectile(page: Page, types: readonly string[], duration: number, bossProjectile?: boolean): Promise<boolean> {
  for (let elapsed = 0; elapsed < duration; elapsed += 150) {
    await page.clock.runFor(150);
    const found = await page.evaluate(({ wanted, pool }) => {
      const units = (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; projectileType?: string; bossProjectile?: boolean; hp: number }> }).__getGunSmokeUnits();
      return units.some((unit) => unit.kind === "enemyBullet" && unit.hp > 0 && unit.projectileType !== undefined && wanted.includes(unit.projectileType) && (pool === undefined || Boolean(unit.bossProjectile) === pool));
    }, { wanted: types, pool: bossProjectile });
    if (found) return true;
  }
  return false;
}

test("starts the WebGPU stage and renders gameplay", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.goto("/");
  await expect(page.locator("#title-screen")).toBeVisible();
  await page.locator("#start-button").click();
  await expect(page.locator("#intro-screen")).toBeVisible();
  await page.locator("#continue-button").click();
  await expect(page.locator("#briefing-screen")).toBeVisible();
  await expect(page.locator("#briefing-boss")).toHaveText("BANDIT BILL");
  await page.locator("#briefing-button").click();
  await expect(page.locator("#hud")).toBeVisible();
  await expect(page.locator("#stage-label")).toHaveText("ROUND 1 HICKSVILLE");
  await expect(page.locator("#boss-label")).toBeHidden();
  await page.keyboard.press("Enter");
  await expect(page.locator("#pause-screen")).toBeVisible();
  await page.locator("#resume-button").click();
  await expect(page.locator("#pause-screen")).toBeHidden();
  await page.keyboard.press("Shift");
  await expect(page.locator("#inventory-screen")).toBeVisible();
  await expect(page.locator("#inventory-weapons")).toContainText("PISTOL UNLIMITED");
  await expect(page.locator('[data-inventory-weapon="pistol"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-inventory-weapon="shotgun"]')).toBeDisabled();
  await expect(page.locator("#inventory-smart-bomb")).toBeDisabled();
  await page.locator("#inventory-close").click();
  await expect(page.locator("#inventory-screen")).toBeHidden();
  await page.keyboard.down("x");
  await page.waitForTimeout(2_500);
  await page.keyboard.up("x");
  await expect(page.locator("#hud")).toBeVisible();
  const hasWebGpuContext = await page.locator("#game-canvas").evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    return canvas.getContext("webgpu") !== null;
  });
  expect(hasWebGpuContext).toBeTruthy();
  expect(pageErrors).toEqual([]);
});

test("renders all six procedural rounds", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  const hashes: string[] = [];
  for (const [stage, name] of ["HICKSVILLE", "ROCKY PASS", "NATIVE VILLAGE", "CLIFF VALLEY", "FOREST", "WINGATE TOWN"].entries()) {
    await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), stage + 1);
    await expect(page.locator("#stage-label")).toHaveText(`ROUND ${stage + 1} ${name}`);
    await page.waitForTimeout(50);
    hashes.push(crypto.createHash("sha256").update(await page.locator("#game-canvas").screenshot()).digest("hex"));
  }
  expect(new Set(hashes).size).toBe(6);
  expect(pageErrors).toEqual([]);
});

test("runs ROM event streams in every round", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  for (let stage = 1; stage <= 6; stage += 1) {
    await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), stage);
    await page.clock.runFor(8_000);
    await expect(page.locator("#stage-label")).toContainText(`ROUND ${stage}`);
    await expect(page.locator("#hud")).toBeVisible();
  }
  expect(pageErrors).toEqual([]);
});

test("creates each Boss from its wanted gate", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  const bosses = ["BANDIT BILL", "CUTTER", "DEVIL HAWK", "NINJA", "FATMAN JOE", "WINGATE"];
  for (const [index, boss] of bosses.entries()) {
    await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), index + 1);
    await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
    await page.waitForTimeout(50);
    await expect(page.locator("#boss-label")).toContainText(boss);
  }
  expect(pageErrors).toEqual([]);
});

test("runs the distinct Boss projectile chains", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));

  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 1);
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  expect(await waitForBossProjectile(page, ["bullet"], 3_000, false)).toBe(true);

  for (const [stage, projectile, duration] of [[2, "boomerang", 7_000], [3, "fireball", 4_000]] as const) {
    await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), stage);
    await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
    expect(await waitForBossProjectile(page, [projectile], duration)).toBe(true);
  }

  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 4);
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  expect(await waitForBossProjectile(page, ["ninjaSmoke"], 3_500)).toBe(true);
  expect(await waitForBossProjectile(page, ["shuriken"], 1_500)).toBe(true);

  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 5);
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  expect(await waitForBossProjectile(page, ["grenadeShell", "grenade"], 20_000)).toBe(true);

  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 6);
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  expect(await waitForBossProjectile(page, ["bullet"], 20_000, true)).toBe(true);
  expect(pageErrors).toEqual([]);
});

test("completes the six-round Boss transition chain", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  for (let stage = 1; stage <= 5; stage += 1) {
    await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), stage);
    await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
    await page.evaluate(() => (window as unknown as { __defeatGunSmokeBoss: () => void }).__defeatGunSmokeBoss());
    await page.clock.runFor(1_700);
    await expect(page.locator("#briefing-screen")).toBeVisible();
    await expect(page.locator("#briefing-round")).toContainText(`ROUND ${stage + 1}`);
    await page.locator("#briefing-button").click();
  }
  await page.evaluate(() => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(6));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  await page.evaluate(() => (window as unknown as { __defeatGunSmokeBoss: () => void }).__defeatGunSmokeBoss());
  await page.clock.runFor(5_000);
  await expect(page.locator("#boss-label")).toContainText("WINGATE II");
  await page.evaluate(() => (window as unknown as { __defeatGunSmokeBoss: () => void }).__defeatGunSmokeBoss());
  await page.clock.runFor(5_000);
  await expect(page.locator("#ending-screen")).toBeHidden();
  await page.clock.runFor(8_000);
  await expect(page.locator("#ending-screen")).toBeVisible();
  await expect(page.locator("#ending-button")).toBeDisabled();
  await page.keyboard.press("Enter");
  await expect(page.locator("#ending-screen")).toBeVisible();
  await page.clock.runFor(69_000);
  await expect(page.locator("#ending-button")).toBeEnabled();
  await page.locator("#ending-button").click();
  await expect(page.locator("#title-screen")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("accepts gamepad Start from the title flow", async ({ page }) => {
  await page.addInitScript(() => {
    let startPressed = false;
    Object.defineProperty(window, "__setStartPressed", { value: (pressed: boolean) => { startPressed = pressed; } });
    Object.defineProperty(navigator, "getGamepads", {
      configurable: true,
      value: () => [{
        connected: true,
        id: "test-pad",
        index: 0,
        mapping: "standard",
        timestamp: performance.now(),
        axes: [0, 0],
        buttons: Array.from({ length: 10 }, (_, index) => ({ pressed: index === 9 && startPressed, touched: index === 9 && startPressed, value: index === 9 && startPressed ? 1 : 0 })),
      }],
    });
  });
  await page.goto("/");
  await page.evaluate(() => (window as unknown as { __setStartPressed: (pressed: boolean) => void }).__setStartPressed(true));
  await expect(page.locator("#intro-screen")).toBeVisible();
  await page.evaluate(() => (window as unknown as { __setStartPressed: (pressed: boolean) => void }).__setStartPressed(false));
  await page.waitForTimeout(100);
  await page.evaluate(() => (window as unknown as { __setStartPressed: (pressed: boolean) => void }).__setStartPressed(true));
  await expect(page.locator("#briefing-screen")).toBeVisible();
  await page.evaluate(() => (window as unknown as { __setStartPressed: (pressed: boolean) => void }).__setStartPressed(false));
  await page.waitForTimeout(100);
  await page.evaluate(() => (window as unknown as { __setStartPressed: (pressed: boolean) => void }).__setStartPressed(true));
  await expect(page.locator("#hud")).toBeVisible();
  await page.evaluate(() => (window as unknown as { __setStartPressed: (pressed: boolean) => void }).__setStartPressed(false));
  await page.waitForTimeout(100);
  await page.evaluate(() => (window as unknown as { __setStartPressed: (pressed: boolean) => void }).__setStartPressed(true));
  await expect(page.locator("#pause-screen")).toBeVisible();
  await page.evaluate(() => (window as unknown as { __setStartPressed: (pressed: boolean) => void }).__setStartPressed(false));
  await page.waitForTimeout(100);
  await page.evaluate(() => (window as unknown as { __setStartPressed: (pressed: boolean) => void }).__setStartPressed(true));
  await expect(page.locator("#pause-screen")).toBeHidden();
});

test("continues the current Round after Game Over", async ({ page }) => {
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __showGunSmokeGameOver: () => void }).__showGunSmokeGameOver());
  await expect(page.locator("#game-over")).toBeVisible();
  await expect(page.locator("#game-over-continue")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#briefing-screen")).toBeVisible();
  await expect(page.locator("#briefing-round")).toContainText("ROUND 1");
  await page.locator("#briefing-button").click();
  await expect(page.locator("#lives-label")).toHaveText("LIVES 3");
  await page.evaluate(() => (window as unknown as { __showGunSmokeGameOver: () => void }).__showGunSmokeGameOver());
  await page.keyboard.down("Shift");
  await page.waitForTimeout(50);
  await page.keyboard.up("Shift");
  await expect(page.locator("#restart-button")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#title-screen")).toBeVisible();
});

test("does not spawn a trading post before the first ROM event", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.keyboard.down("ArrowUp");
  for (let index = 0; index < 8; index += 1) {
    const key = index % 2 === 0 ? "ArrowLeft" : "ArrowRight";
    await page.keyboard.down(key);
    await runPistolWithClock(page, 1_800);
    await page.keyboard.up(key);
  }
  await page.keyboard.up("ArrowUp");
  await expect(page.locator("#shop")).toBeHidden();
});

test("reaches the first ROM weapon shop", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.keyboard.down("ArrowLeft");
  await runPistolWithClock(page, 45_000, ["x"]);
  await page.keyboard.up("ArrowLeft");
  await page.keyboard.down("ArrowRight");
  await runPistolWithClock(page, 450, ["x"]);
  await page.keyboard.up("ArrowRight");
  if (!await page.locator("#shop").isVisible()) await runPistolWithClock(page, 8_000, ["x"]);
  await expect(page.locator("#shop")).toBeVisible();
  await expect(page.locator("#lives-label")).not.toHaveText("LIVES 0");
  await expect(page.locator("#shop-title")).toHaveText("WEAPON SHOP / ROUND 1");
  await expect(page.locator('[data-shop-item="shotgun"]')).toBeVisible();
  await expect(page.locator('[data-shop-item="horse"]')).toBeHidden();
});

test("keeps ROM barrel pickups in the object pool", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 1);
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.clock.runFor(5_000);
  const before = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; itemType?: string; romPool?: string; romEntityCode?: number }> }).__getGunSmokeUnits());
  expect(before).toContainEqual(expect.objectContaining({ kind: "barrel", romEntityCode: 33, romPool: "object" }));
  await page.evaluate(() => (window as unknown as { __breakGunSmokeBarrel: (entityCode: number) => void }).__breakGunSmokeBarrel(33));
  const after = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; itemType?: string; romPool?: string; romEntityCode?: number }> }).__getGunSmokeUnits());
  expect(after).toContainEqual(expect.objectContaining({ kind: "item", itemType: "boots", romPool: "object", romEntityCode: 33 }));
});

test("runs a locally supplied reference ROM through the engine", async ({ page }) => {
  const romPath = path.resolve(process.cwd(), "Gun.Smoke.ZH.NES");
  test.skip(!fs.existsSync(romPath), "Reference ROM is intentionally not present in clean clones");
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.goto("/");
  await page.locator("#reference-rom").setInputFiles(romPath);
  await expect(page.locator("#rom-status")).toContainText("Reference ROM active", { timeout: 5_000 });
  await expect(page.locator("#rom-status")).toContainText("Hz");
  await expect(page.locator("#title-screen")).toBeHidden();
  const referenceViewport = await page.locator("#game-canvas").getAttribute("data-reference-viewport");
  const viewportParts = (referenceViewport ?? "0x0").split("x").map(Number);
  const referenceWidth = viewportParts[0] ?? 0;
  const referenceHeight = viewportParts[1] ?? 0;
  expect(referenceHeight).toBeCloseTo(240, 0);
  expect(referenceWidth / referenceHeight).toBeCloseTo(958 / 538, 2);
  const referenceScale = Number(await page.locator("#game-canvas").getAttribute("data-reference-scale"));
  expect(referenceScale).toBeGreaterThan(2);
  expect(referenceScale).toBeCloseTo(538 / 240, 2);
  const first = await page.locator("#game-canvas").screenshot();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  const afterStart = await page.locator("#game-canvas").screenshot();
  expect(crypto.createHash("sha256").update(first).digest("hex")).not.toBe(crypto.createHash("sha256").update(afterStart).digest("hex"));
  await page.waitForTimeout(300);
  const second = await page.locator("#game-canvas").screenshot();
  expect(crypto.createHash("sha256").update(first).digest("hex")).not.toBe(crypto.createHash("sha256").update(second).digest("hex"));
  expect(pageErrors).toEqual([]);
});

test("rejects non-iNES reference files", async ({ page }) => {
  await page.goto("/");
  await page.locator("#reference-rom").setInputFiles({
    name: "not-a-rom.nes",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("not an iNES file"),
  });
  await expect(page.locator("#rom-status")).toContainText("Could not load ROM");
  await expect(page.locator("#title-screen")).toBeVisible();
  const header = Buffer.alloc(16);
  header.write("NES\x1a", 0, "binary");
  header[4] = 1;
  await page.locator("#reference-rom").setInputFiles({
    name: "truncated.nes",
    mimeType: "application/octet-stream",
    buffer: header,
  });
  await expect(page.locator("#rom-status")).toContainText("Truncated iNES ROM data");
  await page.locator("#start-button").click();
  await expect(page.locator("#intro-screen")).toBeVisible();
});

test("survives a sustained gameplay run", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.keyboard.down("ArrowLeft");
  await page.keyboard.down("ArrowUp");
  for (let index = 0; index < 160; index += 1) {
    await page.keyboard.press("z");
    await page.keyboard.press("x");
    await page.waitForTimeout(120);
  }
  await page.keyboard.up("ArrowLeft");
  await page.keyboard.up("ArrowUp");
  const canvasSize = await page.locator("#game-canvas").evaluate((element) => ({ width: (element as HTMLCanvasElement).width, height: (element as HTMLCanvasElement).height }));
  expect(canvasSize.width).toBeGreaterThan(0);
  expect(canvasSize.height).toBeGreaterThan(0);
  await expect(page.locator("#hud")).toBeVisible();
  expect(pageErrors).toEqual([]);
});
