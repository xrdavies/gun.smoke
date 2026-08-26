import { expect, test } from "@playwright/test";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

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

test("reaches the first trading post", async ({ page }) => {
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.waitForTimeout(12_800);
  await expect(page.locator("#shop")).toBeVisible();
  await expect(page.locator("#shop-title")).toHaveText("WEAPON SHOP / ROUND 1");
  await expect(page.locator("#shop-message")).toHaveText("POINTS 000000");
  await expect(page.locator('[data-shop-item="shotgun"]')).toContainText("$06000");
  await expect(page.locator('[data-shop-item="smartBomb"]')).toBeVisible();
  await expect(page.locator('[data-shop-item="horse"]')).toBeHidden();
  await expect(page.locator('[data-shop-item="ammo"]')).toBeHidden();
  await expect(page.locator('[data-shop-item="wanted"]')).toBeHidden();
  await expect(page.locator('[data-shop-item="magnum"]')).toBeDisabled();
  await page.locator("#shop-close").click();
  await expect(page.locator("#shop")).toBeHidden();
  await expect(page.locator("#hud")).toBeVisible();
});

test("switches from the weapon shop to the supply shop", async ({ page }) => {
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.locator("#briefing-button").click();
  await page.waitForTimeout(12_800);
  await expect(page.locator("#shop-title")).toHaveText("WEAPON SHOP / ROUND 1");
  await page.locator("#shop-close").click();
  await page.waitForTimeout(13_500);
  await expect(page.locator("#shop-title")).toHaveText("SUPPLY SHOP / ROUND 1");
  await expect(page.locator('[data-shop-item="shotgun"]')).toBeHidden();
  await expect(page.locator('[data-shop-item="smartBomb"]')).toBeHidden();
  await expect(page.locator('[data-shop-item="horse"]')).toBeVisible();
  await expect(page.locator('[data-shop-item="horse"]')).toBeDisabled();
  await expect(page.locator('[data-shop-item="wanted"]')).toBeVisible();
  await expect(page.locator('[data-shop-item="wanted"]')).toBeDisabled();
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
  await page.keyboard.down("z");
  await page.keyboard.down("x");
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(20_000);
  await page.keyboard.up("ArrowLeft");
  await page.keyboard.up("x");
  await page.keyboard.up("z");
  const canvasSize = await page.locator("#game-canvas").evaluate((element) => ({ width: (element as HTMLCanvasElement).width, height: (element as HTMLCanvasElement).height }));
  expect(canvasSize.width).toBeGreaterThan(0);
  expect(canvasSize.height).toBeGreaterThan(0);
  await expect(page.locator("#hud")).toBeVisible();
  expect(pageErrors).toEqual([]);
});
