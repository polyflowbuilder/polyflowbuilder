// NOTE: need ignores bc we need the .ts extension for Playwright
// see https://playwright.dev/docs/test-typescript#typescript-with-esm

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { createUserAccount, deleteUserAccount } from '../util/userTestUtil.ts';

import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const RESET_PASSWORD_PAGE_TESTS_EMAIL = 'pfb_test_resetPasswordPage_playwright@test.com';
const RESET_PASSWORD_VALID_URL = `/resetpassword?token=${encodeURIComponent(
  'testtoken'
)}&email=${RESET_PASSWORD_PAGE_TESTS_EMAIL}`;

async function createToken(prisma: PrismaClient, expireNow = false) {
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 30);
  await prisma.token.create({
    data: {
      email: RESET_PASSWORD_PAGE_TESTS_EMAIL,
      token: 'testtoken',
      type: 'PASSWORD_RESET',
      expiresUTC: expireNow ? new Date(Date.now()) : expiryDate
    }
  });
}

async function deleteToken(prisma: PrismaClient) {
  await prisma.token.delete({
    where: {
      email_token: {
        email: RESET_PASSWORD_PAGE_TESTS_EMAIL,
        token: 'testtoken'
      }
    }
  });
}

test.describe('reset password page tests (no token)', () => {
  test('navigation with no searchparams redirects', async ({ page }) => {
    await page.goto('/resetpassword');

    expect(page).toHaveURL(/.*forgotpassword/);
    expect(await page.textContent('h2')).toBe('Request Password Reset');
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'The provided password reset link has expired or is incorrect. Please try the reset process again.'
    );
  });

  test('navigation with invalid token searchparam redirects', async ({ page }) => {
    await page.goto(RESET_PASSWORD_VALID_URL);

    expect(page).toHaveURL(/.*forgotpassword/);
    expect(await page.textContent('h2')).toBe('Request Password Reset');
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'The provided password reset link has expired or is incorrect. Please try the reset process again.'
    );
  });

  test('navigation with invalid email searchparam redirects', async ({ page }) => {
    await page.goto(`/resetpassword?token=${encodeURIComponent('testtoken')}&email=invalidemail`);

    expect(page).toHaveURL(/.*forgotpassword/);
    expect(await page.textContent('h2')).toBe('Request Password Reset');
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'The provided password reset link has expired or is incorrect. Please try the reset process again.'
    );
  });
});

test.describe('reset password page tests (token)', () => {
  const prisma = new PrismaClient();

  test.beforeAll(async () => {
    // create account
    await createUserAccount(RESET_PASSWORD_PAGE_TESTS_EMAIL, 'test', 'test');

    // set up token in DB
    await createToken(prisma);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(RESET_PASSWORD_VALID_URL);
  });

  test.afterAll(async () => {
    // delete account
    await deleteUserAccount(RESET_PASSWORD_PAGE_TESTS_EMAIL);
  });

  test('authorized reset password page has expected content', async ({ page }) => {
    expect(page).toHaveURL(/.*resetpassword/);
    expect(await page.textContent('h2')).toBe('Reset Password');
    await expect(page.locator('button')).toBeVisible();
  });

  test('reset password with empty fields fails', async ({ page }) => {
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.locator('input#password:invalid')).toBeVisible();
  });

  test('reset password with empty passwordConfirm field fails', async ({ page }) => {
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.locator('input#passwordConfirm:invalid')).toBeVisible();
  });

  test('password and passwordConfirm dont match', async ({ page }) => {
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('notthesame');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.locator('#passwordError')).toBeVisible();
    await expect(page.locator('#passwordError')).toHaveText(
      'Password and Repeat Password fields must match.'
    );
    await expect(page.locator('#passwordConfirmError')).toBeVisible();
    await expect(page.locator('#passwordConfirmError')).toHaveText(
      'Password and Repeat Password fields must match.'
    );

    await expect(page.getByPlaceholder('Password', { exact: true })).toHaveValue('');
    await expect(page.getByPlaceholder('Repeat Password', { exact: true })).toHaveValue('');
  });

  test('token gets deleted before reset can happen', async ({ page }) => {
    // delete token from DB side
    await deleteToken(prisma);

    // fill and submit
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'Password reset token expired. Please try the reset process again.'
    );

    // recreate the token
    await createToken(prisma);
  });

  test('token expires before reset can happen', async ({ page }) => {
    // create token that instantly expired
    await deleteToken(prisma);
    await createToken(prisma, true);

    // fill and submit
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'Password reset token expired. Please try the reset process again.'
    );

    // reset token
    await deleteToken(prisma);
    await createToken(prisma);
  });

  test('500 failure case', async ({ page }) => {
    // mock 500 invalid response
    await page.route(RESET_PASSWORD_VALID_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: String.raw`{"type":"failure","status":500,"data":"[{\"error\":1},true]"}`
      });
    });

    // fill and submit
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'An error occurred while attempting to reset your password. Please try again a bit later.'
    );
  });

  test('password successfully reset', async ({ page }) => {
    // fill and submit
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page).toHaveURL(/.*login/);
    expect(await page.textContent('h2')).toBe('Sign In');
    await expect(page.locator('button')).toBeVisible();
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toHaveText(
      'Password successfully reset! Please login.'
    );
  });
});
