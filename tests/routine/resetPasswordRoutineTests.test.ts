import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { performLoginFrontend } from '../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';

const RESET_PASSWORD_ROUTINE_TESTS_EMAIL = 'pfb_test_resetPasswordRoutine_playwright@test.com';

test.describe('reset password routine tests', () => {
  const prisma = new PrismaClient();
  test.beforeAll(async () => {
    // create account
    await createUser({
      email: RESET_PASSWORD_ROUTINE_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(RESET_PASSWORD_ROUTINE_TESTS_EMAIL);
  });

  test('user can log in normally with original password', async ({ page }) => {
    await performLoginFrontend(page, RESET_PASSWORD_ROUTINE_TESTS_EMAIL, 'test');

    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');

    expect((await page.context().cookies())[0].name).toBe('sId');
    await page.context().clearCookies();
  });

  test('user initiates reset password request', async ({ page }) => {
    // navigate to login
    await page.goto('/login', {
      waitUntil: 'networkidle'
    });
    expect((await page.textContent('h2'))?.trim()).toBe('Sign In');
    await expect(page.locator('button')).toBeVisible();

    // click on forgot password
    await page.getByRole('link', { name: 'Forgot your password?' }).click();
    await expect(page).toHaveURL(/.*forgotpassword/);

    // enter email and submit request
    await page.getByLabel('email').fill(RESET_PASSWORD_ROUTINE_TESTS_EMAIL);
    await page.getByRole('button', { name: 'Submit Password Reset Request' }).click();
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toHaveText(
      'An email to reset your password has been sent. Please check it!'
    );
  });

  test('user navigates to reset password link and resets password', async ({ page }) => {
    // get the token from the DB
    const res = await prisma.token.findFirst({
      where: {
        email: RESET_PASSWORD_ROUTINE_TESTS_EMAIL,
        type: 'PASSWORD_RESET'
      },
      select: {
        token: true
      }
    });

    if (!res) {
      throw new Error('res did not return a valid token');
    }

    await page.goto(
      `/resetpassword?token=${encodeURIComponent(
        res.token
      )}&email=${RESET_PASSWORD_ROUTINE_TESTS_EMAIL}`,
      {
        waitUntil: 'networkidle'
      }
    );
    expect(page).toHaveURL(/.*resetpassword/);
    expect((await page.textContent('h2'))?.trim()).toBe('Reset Password');
    await expect(page.locator('button')).toBeVisible();

    // enter a new password
    await page.getByPlaceholder('Password', { exact: true }).fill('newpassword');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('newpassword');
    await page.getByRole('button', { name: 'Reset Password' }).click();

    // check that this was successful
    await expect(page).toHaveURL(/.*login/);
    expect((await page.textContent('h2'))?.trim()).toBe('Sign In');
    await expect(page.locator('button')).toBeVisible();
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toHaveText(
      'Password successfully reset! Please login.'
    );
  });

  test('user cannot log in with old password', async ({ page }) => {
    // check that we're on the login page
    await page.goto('/login', {
      waitUntil: 'networkidle'
    });

    await expect(page).toHaveURL(/.*login/);
    expect((await page.textContent('h2'))?.trim()).toBe('Sign In');
    await expect(page.locator('button')).toBeVisible();

    // enter old credentials
    await page.getByLabel('email').fill(RESET_PASSWORD_ROUTINE_TESTS_EMAIL);
    await page.getByLabel('password').fill('test');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'Incorrect email address and/or password.'
    );
  });

  test('user able to log in with new password', async ({ page }) => {
    await performLoginFrontend(page, RESET_PASSWORD_ROUTINE_TESTS_EMAIL, 'newpassword');

    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');

    expect((await page.context().cookies())[0].name).toBe('sId');
  });
});
