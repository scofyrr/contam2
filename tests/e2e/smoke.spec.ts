import { test, expect } from "@playwright/test";

test.describe("Smoke E2E", () => {
  test("la app carga la página principal", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
});
