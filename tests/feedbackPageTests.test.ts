import { expect, test } from '@playwright/test';

// TODO: detect this in backend and filter these feedbacks out
const FEEDBACK_CONTENT = 'test_feedback_pfb';

// TODO: add test for the failed case
test.describe('feedback page tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/feedback');
  });

  test('feedback page has expected content', async ({ page }) => {
    expect(await page.textContent('h2')).toBe('Submit Feedback');
    await expect(page.locator('button')).toBeVisible();
  });

  test('feedback succeeds without email', async ({ page }) => {
    await page.getByLabel('feedback').fill(FEEDBACK_CONTENT);
    await page.getByRole('button', { name: 'Submit Feedback' }).click();

    await expect(page.locator('.alert-success')).toBeVisible();
  });

  test('feedback fails with invalid email', async ({ page }) => {
    await page.getByLabel('email').fill('invalidemail');
    await page.getByLabel('feedback').fill(FEEDBACK_CONTENT);
    await page.getByRole('button', { name: 'Submit Feedback' }).click();

    // with the way the submit feedback form works, we don't have any
    // error validation that manipulates the DOM, so just check that the
    // field is marked as required and trust that the browser will display
    // the error
    // see https://stackoverflow.com/questions/74408030/playwright-test-test-that-input-is-required
    // TODO: add error validation that we can test with Playwright
    await expect(page.locator('input#email:invalid')).toBeVisible();
  });

  test('feedback succeeds with valid email', async ({ page }) => {
    await page.getByLabel('email').fill('test@test.com');
    await page.getByLabel('feedback').fill(FEEDBACK_CONTENT);
    await page.getByRole('button', { name: 'Submit Feedback' }).click();

    await expect(page.locator('.alert-success')).toBeVisible();
  });
});
