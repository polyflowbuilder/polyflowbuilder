import { expect, test } from '@playwright/test';

test.describe('error page tests', () => {
  test('navigate to unknown page', async ({ page }) => {
    await page.goto('/thisisnotavalidroute');

    await expect(page.locator('.notFoundExclamation')).toBeVisible();
    await expect(page.locator('.font-semibold')).toHaveText(
      'The page you requested could not be found. Sorry about that!'
    );
  });

  test('force error in another page to render 500', async ({ page }) => {
    await page.goto('/__errortest');

    await expect(page.locator('.internalErrorExclamation')).toBeVisible();
    await expect(page.locator('.font-semibold')).toHaveText(
      'An internal server error has occurred. Please reload the page.'
    );
  });
});
