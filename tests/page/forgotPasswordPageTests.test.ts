import { expect, test } from '@playwright/test';

// TODO: add redirect check if user is authenticated
test.describe('forgot password page tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgotpassword');
  });

  test('forgot password page has expected content', async ({ page }) => {
    expect(await page.textContent('h2')).toBe('Request Password Reset');
    await expect(page.locator('button')).toBeVisible();
  });

  test('submit password reset request fails without email', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit Password Reset Request' }).click();

    await expect(page.locator('input#email:invalid')).toBeVisible();
  });

  test('submit password reset request fails with invalid email (type 1)', async ({ page }) => {
    await page.getByLabel('email').fill('incorrect');
    await page.getByRole('button', { name: 'Submit Password Reset Request' }).click();

    await expect(page.locator('input#email:invalid')).toBeVisible();
  });

  test('submit password reset request fails with invalid email (type 2)', async ({ page }) => {
    await page.getByLabel('email').fill('test@test');
    await page.getByRole('button', { name: 'Submit Password Reset Request' }).click();

    await expect(page.locator('#emailError')).toBeVisible();
    await expect(page.locator('#emailError')).toHaveText('Email must be a valid email address.');
  });

  test('success dialog appears on submit password reset request success', async ({ page }) => {
    await page.getByLabel('email').fill('test@test.com');
    await page.getByRole('button', { name: 'Submit Password Reset Request' }).click();

    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toHaveText(
      'An email to reset your password has been sent. Please check it!'
    );
  });

  test('500 error case', async ({ page }) => {
    // mock 500 invalid response
    await page.route('/forgotpassword', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: String.raw`{"type":"failure","status":500,"data":"[{\"error\":1},true]"}`
      });
    });

    await page.getByLabel('email').fill('test@test.com');
    await page.getByRole('button', { name: 'Submit Password Reset Request' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'An error occurred when sending the password reset request. Please try again a bit later.'
    );
  });
});
