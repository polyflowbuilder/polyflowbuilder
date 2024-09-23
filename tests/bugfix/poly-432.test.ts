import { deleteUser } from '$lib/server/db/user';
import { expect, test } from '@playwright/test';
import { getUserEmailString } from '$test/util/userTestUtil';

// bug description: going from /register to /login pages by
// clicking links (e.g. the "Sign In" link on the /register page)
// displays the "Account created! Please login" message unexpectedly

test.describe('poly-432 bugfix tests', () => {
  test.describe.configure({ mode: 'serial' });
  let userEmail: string;

  test.afterAll(async () => {
    // delete account
    await deleteUser(userEmail);
  });

  test('do not see account created message on regular navigation', async ({ page }, testInfo) => {
    // populate userEmail in first test where we have access to testInfo
    userEmail = getUserEmailString('pfb_test_poly-432_playwright@test.com', testInfo);

    await page.goto('/');

    await page.goto('/login');
    await expect(page.locator('.alert-success')).not.toBeVisible();

    await page.getByRole('link', { name: 'Create an account' }).click();
    await expect(page).toHaveURL(/.*register/);

    await page.getByRole('main').getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('.alert-success')).not.toBeVisible();

    await page.getByRole('link', { name: 'Create Account' }).click();
    await expect(page).toHaveURL(/.*register/);

    await page.getByRole('main').getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('.alert-success')).not.toBeVisible();
  });

  test('see account created message on correct navigation', async ({ page }) => {
    await page.goto('/register', {
      // wait for client-side load functions to finish
      waitUntil: 'networkidle'
    });

    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill(userEmail);
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    await expect(page).toHaveURL(/.*login/);
    expect((await page.textContent('h2'))?.trim()).toBe('Sign In');
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toHaveText(
      'Account successfully created! Please login.'
    );

    // message disappears on refresh
    await page.reload();
    await expect(page.locator('.alert-success')).not.toBeVisible();
  });
});
