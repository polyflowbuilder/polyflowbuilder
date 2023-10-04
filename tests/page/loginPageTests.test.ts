import { expect, test } from '@playwright/test';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginFrontend } from 'tests/util/userTestUtil';

test.describe('login page tests', () => {
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString('pfb_test_loginPage_playwright@test.com', testInfo);
    await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', {
      waitUntil: 'networkidle'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(userEmail);
  });

  test('login page has expected h2', async ({ page }) => {
    expect((await page.textContent('h2'))?.trim()).toBe('Sign In');
    await expect(page.locator('button')).toBeVisible();
  });

  test('login fails with blank form', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('input#email:invalid')).toBeVisible();
  });

  test('login fails with only email (improperly formatted)', async ({ page }) => {
    await page.getByLabel('email').fill('test');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('input#email:invalid')).toBeVisible();
  });

  test('login fails with only email (properly formatted)', async ({ page }) => {
    await page.getByLabel('email').fill('test@test.com');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('input#password:invalid')).toBeVisible();
  });

  test('correct email but incorrect password', async ({ page }) => {
    await page.getByLabel('email').fill(userEmail);
    await page.getByLabel('password').fill('notthecorrectpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'Incorrect email address and/or password.'
    );
  });

  test('incorrect email but correct password', async ({ page }) => {
    await page.getByLabel('email').fill('nonexistentemail@test.com');
    await page.getByLabel('password').fill('test');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'Incorrect email address and/or password.'
    );
  });

  test('correct credentials, check redirect and cookie', async ({ page }) => {
    await performLoginFrontend(page, userEmail, 'test');

    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');

    expect((await page.context().cookies())[0].name).toBe('sId');
  });

  test('500 case with correct credentials', async ({ page }) => {
    // mock 500 invalid response
    await page.route('/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: String.raw`{"type":"failure","status":500,"data":"[{\"error\":1},true]"}`
      });
    });

    await page.getByLabel('email').fill(userEmail);
    await page.getByLabel('password').fill('test');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'An error occurred when attempting login. Please try again a bit later.'
    );
  });
});
