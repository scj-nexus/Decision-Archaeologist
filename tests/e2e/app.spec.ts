import { expect, test } from "@playwright/test";

test("analyzes the bundled demo repo from the landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Mine git history into architecture evidence/i })).toBeVisible();
  await page.getByRole("button", { name: /Try the bundled demo dig site/i }).click();
  await expect(page).toHaveURL(/\/analysis\//);
  await expect(page.getByRole("heading", { name: /The runtime pivoted to Next.js/i })).toBeVisible();
  await page.screenshot({ path: "docs/decision-archaeologist-report.png", fullPage: true });
});
