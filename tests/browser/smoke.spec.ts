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

test("keeps a ROM event at its allocation-frame coordinate", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));

  let gunman: { age: number; screenY: number; romEntityCode?: number; romSlot?: number } | undefined;
  for (let elapsed = 0; elapsed < 5_000 && gunman === undefined; elapsed += 8) {
    await page.clock.runFor(8);
    gunman = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ enemyType?: string; age: number; screenY: number; romEntityCode?: number; romSlot?: number }> }).__getGunSmokeUnits()
      .find((unit) => unit.enemyType === "gunman" && unit.romEntityCode === 6 && unit.romSlot === 0));
  }

  expect(gunman).toBeDefined();
  expect(gunman!.age).toBeLessThanOrEqual(1 / 60.098);
  expect(gunman!.screenY).toBeCloseTo(1, 6);
});

test("fires Devil Hawk's first fan from the updated Boss coordinate", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(3));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  let firstSample: { fireballs: Array<{ age: number; x: number; screenY: number }>; boss: { age: number; x: number; screenY: number } } | undefined;
  for (let elapsed = 0; elapsed < 10_000; elapsed += 8) {
    await page.clock.runFor(8);
    const sample = await page.evaluate(() => {
      const units = (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; projectileType?: string; bossProjectile?: boolean; hp: number; age: number; x: number; screenY: number }> }).__getGunSmokeUnits();
      const boss = units.find((unit) => unit.kind === "boss");
      const fireballs = units.filter((unit) => unit.kind === "enemyBullet" && unit.projectileType === "fireball" && unit.bossProjectile && unit.hp > 0);
      return fireballs.length > 0 && boss ? { fireballs: fireballs.map((fireball) => ({ age: fireball.age, x: fireball.x, screenY: fireball.screenY })), boss: { age: boss.age, x: boss.x, screenY: boss.screenY } } : undefined;
    });
    if (sample) {
      firstSample = sample;
      break;
    }
  }
  expect(firstSample).toBeDefined();
  const central = firstSample!.fireballs.reduce((closest, fireball) => Math.abs(fireball.x - firstSample!.boss.x) < Math.abs(closest.x - firstSample!.boss.x) ? fireball : closest);
  expect(central.age).toBeCloseTo(1 / 60.098, 9);
  expect(central.screenY - firstSample!.boss.screenY).toBeCloseTo(3 * (240 / 240), 6);
});

test("freezes gameplay while the ROM clock continues in inventory", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.clock.runFor(500);
  const before = await page.evaluate(() => (window as unknown as { __getGunSmokeState: () => unknown }).__getGunSmokeState());
  await page.keyboard.press("Shift");
  await expect(page.locator("#inventory-screen")).toBeVisible();
  await page.clock.runFor(500);
  const during = await page.evaluate(() => (window as unknown as { __getGunSmokeState: () => unknown }).__getGunSmokeState());
  expect(during).toEqual(expect.objectContaining({ time: (before as { time: number }).time, scroll: (before as { scroll: number }).scroll }));
  expect((during as { romFrameCounter: number }).romFrameCounter).toBeGreaterThan((before as { romFrameCounter: number }).romFrameCounter);
  expect((during as { randomState: number[] }).randomState).not.toEqual((before as { randomState: number[] }).randomState);
});

test("resets the ROM frame boundary without an extra loop tick", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.clock.runFor(500);
  await page.evaluate(() => (window as unknown as { __forceGunSmokeLoop: () => void }).__forceGunSmokeLoop());
  await page.clock.runFor(20);
  const state = await page.evaluate(() => (window as unknown as { __getGunSmokeState: () => { time: number; scroll: number; romFrameCounter: number; randomState: number[] } }).__getGunSmokeState());
  expect(state).toMatchObject({ time: 0, scroll: 0, romFrameCounter: 0, randomState: [0x88, 0, 0, 0] });
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
    await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
    await page.clock.runFor(8_000);
    await expect(page.locator("#stage-label")).toContainText(`ROUND ${stage}`);
    await expect(page.locator("#hud")).toBeVisible();
  }
  expect(pageErrors).toEqual([]);
});

test("starts untraced bottom Gunmen at the ROM bottom entry", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(4));
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));

  let bottomGunman: { age: number; screenY: number } | undefined;
  for (let elapsed = 0; elapsed < 30_000 && bottomGunman === undefined; elapsed += 50) {
    await page.clock.runFor(50);
    bottomGunman = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ romEntityCode?: number; hp: number; age: number; screenY: number }> }).__getGunSmokeUnits()
      .find((unit) => unit.romEntityCode === 5 && unit.hp > 0));
  }

  expect(bottomGunman).toBeDefined();
  expect(bottomGunman!.age).toBeLessThan(0.2);
  expect(bottomGunman!.screenY).toBeGreaterThan(240);
});

test("keeps Snipers exposed during their firing cooldown", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));

  let sniper: { age: number; visible: boolean; invulnerableUntil: number; volleysFired: number } | undefined;
  for (let elapsed = 0; elapsed < 18_000 && sniper === undefined; elapsed += 100) {
    await page.clock.runFor(100);
    sniper = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ enemyType?: string; age: number; visible: boolean; invulnerableUntil: number; volleysFired: number }> }).__getGunSmokeUnits().find((unit) => unit.enemyType === "sniper" && unit.volleysFired > 0));
  }

  expect(sniper).toBeDefined();
  expect(sniper?.visible).toBe(true);
  expect(sniper!.invulnerableUntil).toBeLessThanOrEqual(sniper!.age);
});

test("keeps an ordinary enemy shot at its allocation coordinate", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(1));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  await page.evaluate(() => (window as unknown as { __fireGunSmokeBoss: () => void }).__fireGunSmokeBoss());
  const launch = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; projectileType?: string; bossProjectile?: boolean; hp: number; x: number; y: number }> }).__getGunSmokeUnits()
    .find((unit) => unit.kind === "enemyBullet" && !unit.bossProjectile && unit.hp > 0));
  expect(launch).toBeDefined();
  await page.clock.runFor(8);
  const firstFrame = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; projectileType?: string; bossProjectile?: boolean; hp: number; age: number; x: number; y: number }> }).__getGunSmokeUnits()
    .find((unit) => unit.kind === "enemyBullet" && !unit.bossProjectile && unit.hp > 0));
  expect(firstFrame).toBeDefined();
  expect(firstFrame!.age).toBeLessThanOrEqual(2 / 60.098);
  expect(firstFrame!.x).toBeCloseTo(launch!.x, 6);
  expect(firstFrame!.y).toBeCloseTo(launch!.y, 6);
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

test("spawns ROM-table reinforcements during a Boss fight", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(3));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());

  let reinforcement = false;
  for (let elapsed = 0; elapsed < 6_000 && !reinforcement; elapsed += 100) {
    await page.clock.runFor(100);
    reinforcement = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; romPool?: string; romEntityCode?: number }> }).__getGunSmokeUnits()
      .some((unit) => unit.kind === "enemy" && unit.romPool === "enemy" && unit.romEntityCode !== undefined));
  }

  expect(reinforcement).toBe(true);
  expect(pageErrors).toEqual([]);
});

test("fires the Ninja Boss opening volley on the traced frame", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(4));
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  const getBossShuriken = () => page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; projectileType?: string; bossProjectile?: boolean; hp: number; age: number; x: number; y: number }> }).__getGunSmokeUnits()
    .filter((unit) => unit.kind === "enemyBullet" && unit.projectileType === "shuriken" && unit.bossProjectile && unit.hp > 0));

  await page.clock.runFor(2_600);
  expect(await getBossShuriken()).toHaveLength(0);
  let firstShuriken: Awaited<ReturnType<typeof getBossShuriken>> = [];
  for (let elapsed = 0; elapsed < 1_000 && firstShuriken.length === 0; elapsed += 1) {
    await page.clock.runFor(1);
    firstShuriken = await getBossShuriken();
  }
  expect(firstShuriken).toHaveLength(4);
  expect(firstShuriken.every((unit) => unit.age <= 2 / 60.098)).toBe(true);
  expect(new Set(firstShuriken.map((unit) => `${unit.x}:${unit.y}`)).size).toBe(1);
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; volleysFired: number }> }).__getGunSmokeUnits()
    .find((unit) => unit.kind === "boss")?.volleysFired)).toBeGreaterThan(0);
  await page.clock.runFor(2_500);
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; volleysFired: number }> }).__getGunSmokeUnits()
    .find((unit) => unit.kind === "boss")?.volleysFired)).toBe(2);
  await page.clock.runFor(5_300);
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; volleysFired: number }> }).__getGunSmokeUnits()
    .find((unit) => unit.kind === "boss")?.volleysFired)).toBe(3);
  await page.clock.runFor(3_100);
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; volleysFired: number }> }).__getGunSmokeUnits()
    .find((unit) => unit.kind === "boss")?.volleysFired)).toBe(4);
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
  const bossProtection = async () => page.evaluate(() => {
    const boss = (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; invulnerableUntil: number }> }).__getGunSmokeUnits().find((unit) => unit.kind === "boss");
    return boss?.invulnerableUntil;
  });

  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 1);
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  expect(await bossProtection()).toBeCloseTo(96 / 60.098, 9);
  await page.clock.runFor(1_700);
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; volleysFired: number }> }).__getGunSmokeUnits().find((unit) => unit.kind === "boss")?.volleysFired)).toBe(0);
  await page.clock.runFor(150);
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; volleysFired: number }> }).__getGunSmokeUnits().find((unit) => unit.kind === "boss")?.volleysFired)).toBe(1);
  await page.evaluate(() => (window as unknown as { __fireGunSmokeBoss: () => void }).__fireGunSmokeBoss());
  expect(await waitForBossProjectile(page, ["bullet"], 300, false)).toBe(true);

  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 2);
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  await page.evaluate(() => (window as unknown as { __fireGunSmokeBoss: () => void }).__fireGunSmokeBoss());
  expect(await waitForBossProjectile(page, ["boomerang"], 300)).toBe(true);
  await page.clock.runFor(400);
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; volleysFired: number }> }).__getGunSmokeUnits().find((unit) => unit.kind === "boss")?.volleysFired)).toBe(1);
  await page.evaluate(() => (window as unknown as { __fireGunSmokeBoss: () => void }).__fireGunSmokeBoss());
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; projectileType?: string; bossProjectile?: boolean; hp: number }> }).__getGunSmokeUnits()
    .filter((unit) => unit.kind === "enemyBullet" && unit.projectileType === "boomerang" && unit.bossProjectile && unit.hp > 0).length)).toBe(2);

  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 3);
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  await page.clock.runFor(6_200);
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; volleysFired: number }> }).__getGunSmokeUnits().find((unit) => unit.kind === "boss")?.volleysFired)).toBe(1);
  await page.clock.runFor(300);
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; volleysFired: number }> }).__getGunSmokeUnits().find((unit) => unit.kind === "boss")?.volleysFired)).toBe(2);
  expect(await waitForBossProjectile(page, ["fireball"], 100)).toBe(true);

  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 4);
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  await page.evaluate(() => (window as unknown as { __fireGunSmokeBoss: () => void }).__fireGunSmokeBoss());
  expect(await waitForBossProjectile(page, ["ninjaSmoke"], 300)).toBe(true);
  expect(await waitForBossProjectile(page, ["shuriken"], 1_500)).toBe(true);

  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 5);
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  expect(await bossProtection()).toBeCloseTo(170 / 60.098, 9);
  await page.evaluate(() => (window as unknown as { __fireGunSmokeBoss: (randomByte: number) => void }).__fireGunSmokeBoss(8));
  expect(await bossProtection()).toBeCloseTo(170 / 60.098, 9);
  expect(await waitForBossProjectile(page, ["grenadeShell", "grenade"], 300)).toBe(true);

  await page.evaluate((round) => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(round), 6);
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  expect(await bossProtection()).toBeCloseTo(185 / 60.098, 9);
  await page.evaluate(() => (window as unknown as { __fireGunSmokeBoss: (randomByte: number) => void }).__fireGunSmokeBoss(1));
  expect(await waitForBossProjectile(page, ["bullet"], 300, true)).toBe(true);
  expect(pageErrors).toEqual([]);
});

test("converts Fatman Joe shells into timed mines", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __setGunSmokeRound: (round: number) => void }).__setGunSmokeRound(5));
  await page.evaluate(() => (window as unknown as { __setGunSmokeInvulnerable: (duration: number) => void }).__setGunSmokeInvulnerable(Number.POSITIVE_INFINITY));
  await page.evaluate(() => (window as unknown as { __forceGunSmokeBoss: () => void }).__forceGunSmokeBoss());
  await page.evaluate(() => (window as unknown as { __fireGunSmokeBoss: (randomByte: number) => void }).__fireGunSmokeBoss(8));
  const launch = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; projectileType?: string; bossProjectile?: boolean; hp: number; x: number; y: number }> }).__getGunSmokeUnits()
    .find((unit) => unit.kind === "enemyBullet" && unit.projectileType === "grenadeShell" && unit.bossProjectile && unit.hp > 0));
  expect(launch).toBeDefined();
  await page.clock.runFor(8);
  const firstFrame = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; projectileType?: string; bossProjectile?: boolean; hp: number; age: number; x: number; y: number }> }).__getGunSmokeUnits()
    .find((unit) => unit.kind === "enemyBullet" && unit.projectileType === "grenadeShell" && unit.bossProjectile && unit.hp > 0));
  expect(firstFrame).toBeDefined();
  expect(firstFrame!.x).toBeCloseTo(launch!.x, 6);
  expect(firstFrame!.y).toBeCloseTo(launch!.y, 6);
  const projectiles = () => page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; projectileType?: string; bossProjectile?: boolean; hp: number }> }).__getGunSmokeUnits()
    .filter((unit) => unit.kind === "enemyBullet" && unit.bossProjectile && unit.hp > 0));
  await page.clock.runFor(300);
  expect((await projectiles()).some((unit) => unit.projectileType === "grenadeShell")).toBe(true);
  await page.clock.runFor(650);
  const mines = await projectiles();
  expect(mines.filter((unit) => unit.projectileType === "grenade")).toHaveLength(5);
  expect(mines.filter((unit) => unit.projectileType === "grenadeController")).toHaveLength(1);
  expect(mines.some((unit) => unit.projectileType === "grenadeShell")).toBe(false);
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
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; defeatAnimationDuration?: number }> }).__getGunSmokeUnits().find((unit) => unit.kind === "boss")?.defeatAnimationDuration)).toBeCloseTo(30 / 60.098, 9);
  await page.clock.runFor(5_000);
  await expect(page.locator("#boss-label")).toContainText("WINGATE II");
  await page.evaluate(() => (window as unknown as { __defeatGunSmokeBoss: () => void }).__defeatGunSmokeBoss());
  expect(await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; defeatAnimationDuration?: number }> }).__getGunSmokeUnits().find((unit) => unit.kind === "boss")?.defeatAnimationDuration)).toBeCloseTo(9 / 60.098, 9);
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

test("returns to Pistol after the final special volley", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.evaluate(() => (window as unknown as { __setGunSmokeWeapon: (weapon: string, ammo: number) => void }).__setGunSmokeWeapon("machinegun", 1));
  await page.keyboard.down("x");
  await page.clock.runFor(120);
  await page.keyboard.up("x");
  await expect(page.locator("#weapon-label")).toContainText("PISTOL");
  const playerBullets = await page.evaluate(() => (window as unknown as { __getGunSmokeUnits: () => Array<{ kind: string; hp: number }> }).__getGunSmokeUnits().filter((unit) => unit.kind === "bullet" && unit.hp > 0).length);
  expect(playerBullets).toBe(2);
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
