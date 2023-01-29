// NOTE: need ignores bc we need the .ts extension for Playwright
// see https://playwright.dev/docs/test-typescript#typescript-with-esm

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { deleteUserAccount } from '../util/userTestUtil.ts';

import { expect, test } from '@playwright/test';

const REGISTER_TESTS_EMAIL = 'pfb_test_registerPage_playwright@test.com';

test.describe('registration page tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test.afterAll(async () => {
    // delete account
    await deleteUserAccount(REGISTER_TESTS_EMAIL);
  });

  test('register page has expected h1', async ({ page }) => {
    expect(await page.textContent('h2')).toBe('Create Account');
    await expect(page.locator('button')).toBeVisible();
  });

  test('register fails with blank form', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Account!' }).click();

    // see feedbackPageTests for this
    await expect(page.locator('input#username:invalid')).toBeVisible();
  });

  test('register fails with only username', async ({ page }) => {
    await page.getByLabel('username').fill('test');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    await expect(page.locator('input#email:invalid')).toBeVisible();
  });

  test('register fails with only username and email', async ({ page }) => {
    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill('test@test.com');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    await expect(page.locator('input#password:invalid')).toBeVisible();
  });

  test('register fails without confirm password', async ({ page }) => {
    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill('test@test.com');
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    await expect(page.locator('input#passwordConfirm:invalid')).toBeVisible();
  });

  test('register fails with invalid email address (type 1)', async ({ page }) => {
    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill('test'); // will trigger browser built-in error
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    await expect(page.locator('input#email:invalid')).toBeVisible();
  });

  test('register fails with invalid email address (type 2)', async ({ page }) => {
    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill('test@test'); // will trigger zod validation
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    // testing zod validation and form action responses
    await expect(page.locator('#emailError')).toBeVisible();
    await expect(page.getByLabel('username')).toHaveValue('test');
    await expect(page.getByLabel('email')).toHaveValue('test@test');
    await expect(page.getByPlaceholder('Password', { exact: true })).toHaveValue('');
    await expect(page.getByPlaceholder('Repeat Password', { exact: true })).toHaveValue('');
  });

  test('register fails with mismatched passwords', async ({ page }) => {
    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill('test@test.com'); // will trigger zod validation
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('different');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    // testing zod validation and form action responses
    await expect(page.locator('#usernameError')).not.toBeVisible();
    await expect(page.locator('#emailError')).not.toBeVisible();
    await expect(page.locator('#passwordError')).toBeVisible();
    await expect(page.locator('#passwordConfirmError')).toBeVisible();
    await expect(page.getByLabel('username')).toHaveValue('test');
    await expect(page.getByLabel('email')).toHaveValue('test@test.com');
    await expect(page.getByPlaceholder('Password', { exact: true })).toHaveValue('');
    await expect(page.getByPlaceholder('Repeat Password', { exact: true })).toHaveValue('');
  });

  test('register fails with invalid email address (type 2) and mismatched passwords', async ({
    page
  }) => {
    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill('test@test'); // will trigger zod validation
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('different');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    // testing zod validation and form action responses
    await expect(page.locator('#usernameError')).not.toBeVisible();
    await expect(page.locator('#emailError')).toBeVisible();
    await expect(page.locator('#passwordError')).toBeVisible();
    await expect(page.locator('#passwordConfirmError')).toBeVisible();
    await expect(page.getByLabel('username')).toHaveValue('test');
    await expect(page.getByLabel('email')).toHaveValue('test@test');
    await expect(page.getByPlaceholder('Password', { exact: true })).toHaveValue('');
    await expect(page.getByPlaceholder('Repeat Password', { exact: true })).toHaveValue('');
  });

  test('registration succeeds and redirects to login page', async ({ page }) => {
    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill(REGISTER_TESTS_EMAIL);
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    await expect(page).toHaveURL(/.*login/);
    expect(await page.textContent('h2')).toBe('Sign In');
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toHaveText(
      'Account successfully created! Please login.'
    );
  });

  test('registration with an existing email fails', async ({ page }) => {
    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill(REGISTER_TESTS_EMAIL);
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    await expect(page).toHaveURL(/.*register/);
    expect(await page.textContent('h2')).toBe('Create Account');
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'An account with this email address already exists. Please use another email address.'
    );
  });

  test('500 case with valid registration data', async ({ page }) => {
    // mock 500 invalid response
    await page.route('/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: String.raw`{"type":"failure","status":500,"data":"[{\"error\":1},true]"}`
      });
    });

    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill(REGISTER_TESTS_EMAIL);
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    await expect(page).toHaveURL(/.*register/);
    expect(await page.textContent('h2')).toBe('Create Account');
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'An error occurred when registering your account. Please try again a bit later.'
    );
  });
});
