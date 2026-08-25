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
  await expect(page.locator("#hud")).toBeVisible();
  await expect(page.locator("#stage-label")).toHaveText("ROUND 1 HICKSVILLE");
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

test("reaches the first trading post", async ({ page }) => {
  await page.goto("/");
  await page.locator("#start-button").click();
  await page.locator("#continue-button").click();
  await page.waitForTimeout(7_800);
  await expect(page.locator("#shop")).toBeVisible();
  await expect(page.locator("#shop-title")).toContainText("ROUND 1");
  await expect(page.locator('[data-shop-item="magnum"]')).toBeDisabled();
  await page.locator("#shop-close").click();
  await expect(page.locator("#shop")).toBeHidden();
  await expect(page.locator("#hud")).toBeVisible();
});

test("runs a locally supplied reference ROM through the engine", async ({ page }) => {
  const romPath = path.resolve(process.cwd(), "Gun.Smoke.ZH.NES");
  test.skip(!fs.existsSync(romPath), "Reference ROM is intentionally not present in clean clones");
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.goto("/");
  await page.locator("#reference-rom").setInputFiles(romPath);
  await expect(page.locator("#rom-status")).toContainText("Reference ROM active", { timeout: 5_000 });
  await expect(page.locator("#title-screen")).toBeHidden();
  const first = await page.locator("#game-canvas").screenshot();
  await page.waitForTimeout(300);
  const second = await page.locator("#game-canvas").screenshot();
  expect(crypto.createHash("sha256").update(first).digest("hex")).not.toBe(crypto.createHash("sha256").update(second).digest("hex"));
  expect(pageErrors).toEqual([]);
});
