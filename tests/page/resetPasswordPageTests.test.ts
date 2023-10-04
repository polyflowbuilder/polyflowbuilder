import { createToken } from 'tests/util/tokenTestUtil';
import { PrismaClient } from '@prisma/client';
import { expect, test } from '@playwright/test';
import { clearTokensByEmail } from '$lib/server/db/token';
import { getUserEmailString } from 'tests/util/userTestUtil';
import { createUser, deleteUser } from '$lib/server/db/user';

test.describe('reset password page tests (no token)', () => {
  test('navigation with no searchparams redirects', async ({ page }) => {
    await page.goto('/resetpassword');

    await expect(page).toHaveURL(/.*forgotpassword/);
    expect((await page.textContent('h2'))?.trim()).toBe('Request Password Reset');
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'The provided password reset link has expired or is incorrect. Please try the reset process again.'
    );
  });

  test('navigation with invalid token searchparam redirects', async ({ page }) => {
    await page.goto(`/resetpassword?token=${encodeURIComponent('testtoken')}&email=test@test.com`);

    await expect(page).toHaveURL(/.*forgotpassword/);
    expect((await page.textContent('h2'))?.trim()).toBe('Request Password Reset');
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'The provided password reset link has expired or is incorrect. Please try the reset process again.'
    );
  });

  test('navigation with invalid email searchparam redirects', async ({ page }) => {
    await page.goto(`/resetpassword?token=${encodeURIComponent('testtoken')}&email=invalidemail`);

    await expect(page).toHaveURL(/.*forgotpassword/);
    expect((await page.textContent('h2'))?.trim()).toBe('Request Password Reset');
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'The provided password reset link has expired or is incorrect. Please try the reset process again.'
    );
  });
});

test.describe('reset password page tests (token)', () => {
  const prisma = new PrismaClient();
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString('pfb_test_resetPasswordPage_playwright@test.com', testInfo);
    await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });

    // set up token in DB
    await createToken(prisma, userEmail, 'PASSWORD_RESET');
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/resetpassword?token=${encodeURIComponent('testtoken')}&email=${userEmail}`, {
      waitUntil: 'networkidle'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(userEmail);
  });

  test('authorized reset password page has expected content', async ({ page }) => {
    await expect(page).toHaveURL(/.*resetpassword/);
    expect((await page.textContent('h2'))?.trim()).toBe('Reset Password');
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
    await clearTokensByEmail(userEmail, 'PASSWORD_RESET', prisma);

    // fill and submit
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'Password reset token expired. Please try the reset process again.'
    );

    // recreate the token
    await createToken(prisma, userEmail, 'PASSWORD_RESET');
  });

  test('token expires before reset can happen', async ({ page }) => {
    // create token that instantly expired
    await clearTokensByEmail(userEmail, 'PASSWORD_RESET', prisma);
    await createToken(prisma, userEmail, 'PASSWORD_RESET', true);

    // wait 1 second bc time precision is 1 second, so need to wait 1 second
    // for instant expiry to take effect
    await new Promise((r) => setTimeout(r, 1000));

    // fill and submit
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'Password reset token expired. Please try the reset process again.'
    );

    // reset token
    await clearTokensByEmail(userEmail, 'PASSWORD_RESET', prisma);
    await createToken(prisma, userEmail, 'PASSWORD_RESET');
  });

  test('500 failure case', async ({ page }) => {
    // mock 500 invalid response
    await page.route(
      `/resetpassword?token=${encodeURIComponent('testtoken')}&email=${userEmail}`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: String.raw`{"type":"failure","status":500,"data":"[{\"error\":1},true]"}`
        });
      }
    );

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
    expect((await page.textContent('h2'))?.trim()).toBe('Sign In');
    await expect(page.locator('button')).toBeVisible();
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toHaveText(
      'Password successfully reset! Please login.'
    );
  });
});
