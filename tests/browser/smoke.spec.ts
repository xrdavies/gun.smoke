import { expect, test } from "@playwright/test";

test("starts the WebGPU stage and renders gameplay", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.goto("/");
  await expect(page.locator("#title-screen")).toBeVisible();
  await page.locator("#start-button").click();
  await expect(page.locator("#hud")).toBeVisible();
  await expect(page.locator("#stage-label")).toHaveText("STAGE 1");
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
