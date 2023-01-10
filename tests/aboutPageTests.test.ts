import { expect, test } from '@playwright/test';

test.describe('about page tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('about page has expected h1', async ({ page }) => {
    expect(await page.textContent('h1')).toBe('About PolyFlowBuilder');
  });

  test('about page image is visible', async ({ page }) => {
    await expect(page.locator('img')).toBeVisible();
  });
});
