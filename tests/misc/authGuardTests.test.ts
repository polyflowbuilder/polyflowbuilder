// NOTE: need ignores bc we need the .ts extension for Playwright
// see https://playwright.dev/docs/test-typescript#typescript-with-esm

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { createUserAccount, deleteUserAccount, performLogin } from '../util/userTestUtil.ts';

import { expect, Page, test } from '@playwright/test';

const AUTH_GUARD_TESTS_EMAIL = 'pfb_test_authGuards_playwright@test.com';

async function canAccessAboutPage(page: Page) {
  await page.goto('/about');
  await expect(page).toHaveURL(/.*about/);
  expect(await page.textContent('h1')).toBe('About PolyFlowBuilder');
}
async function canAccessFeedbackPage(page: Page) {
  await page.goto('/feedback');
  await expect(page).toHaveURL(/.*feedback/);
  expect(await page.textContent('h2')).toBe('Submit Feedback');
  await expect(page.locator('button')).toBeVisible();
}

async function verifyFlowsPage(page: Page) {
  await expect(page).toHaveURL(/.*flows/);
  expect(await page.textContent('h1')).toBe('flows');
}

test.describe('auth guard tests', () => {
  test.beforeAll(async () => {
    // create account
    await createUserAccount(AUTH_GUARD_TESTS_EMAIL, 'test', 'test');
  });

  test.afterAll(async () => {
    // delete account
    await deleteUserAccount(AUTH_GUARD_TESTS_EMAIL);
  });

  // unauthenticated access
  test('check guards under unauthenticated status', async ({ page }) => {
    // should be able to access these regardless of auth status
    await canAccessAboutPage(page);
    await canAccessFeedbackPage(page);

    // accessible under unauthenticated status

    // homepage
    await page.goto('/');
    await expect(page).toHaveURL(/.*/);
    expect(await page.textContent('h1')).toBe('Welcome to PolyFlowBuilder!');

    // forgot password page
    await page.goto('/forgotpassword');
    await expect(page).toHaveURL(/.*forgotpassword/);
    expect(await page.textContent('h2')).toBe('Request Password Reset');
    await expect(page.locator('button')).toBeVisible();

    // reset password page - guarded under its own thing
    await page.goto('/resetpassword');
    expect(page).toHaveURL(/.*forgotpassword/);
    expect(await page.textContent('h2')).toBe('Request Password Reset');
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'The provided password reset link has expired or is incorrect. Please try the reset process again.'
    );

    // login page
    await page.goto('/login');
    await expect(page).toHaveURL(/.*login/);
    expect(await page.textContent('h2')).toBe('Sign In');
    await expect(page.locator('button')).toBeVisible();

    // register page
    await page.goto('/register');
    await expect(page).toHaveURL(/.*register/);
    expect(await page.textContent('h2')).toBe('Create Account');
    await expect(page.locator('button')).toBeVisible();

    // redirected under unauthenticated status
    await page.goto('/flows');
    await expect(page).toHaveURL(/.*login/);
    expect(await page.textContent('h2')).toBe('Sign In');
    await expect(page.locator('button')).toBeVisible();
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'You are unauthorized to access the requested resource. Please sign in.'
    );
  });

  test('check guards under authenticated status', async ({ page }) => {
    await performLogin(page, AUTH_GUARD_TESTS_EMAIL, 'test');

    // should be able to access these regardless of auth status
    await canAccessAboutPage(page);
    await canAccessFeedbackPage(page);

    // accessible under authenticated status

    // flows page
    await page.goto('/flows');
    await verifyFlowsPage(page);

    // redirected under authenticated status

    // homepage
    await page.goto('/');
    await verifyFlowsPage(page);

    // forgotpassword page
    await page.goto('/forgotpassword');
    await verifyFlowsPage(page);

    // resetpassword page
    await page.goto('/resetpassword');
    await verifyFlowsPage(page);

    // login page
    await page.goto('/login');
    await verifyFlowsPage(page);

    // register page
    await page.goto('/register');
    await verifyFlowsPage(page);
  });
});
