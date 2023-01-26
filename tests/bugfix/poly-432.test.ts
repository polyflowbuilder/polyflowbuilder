import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// bug description: going from /register to /login pages by
// clicking links (e.g. the "Sign In" link on the /register page)
// displays the "Account created! Please login" message unexpectedly

const POLY_432_TESTS_EMAIL = 'pfb_test_poly-432_playwright@test.com';

test.describe('poly-432 bugfix tests', () => {
  const prisma = new PrismaClient();

  test.afterAll(async () => {
    console.log('deleting account used for poly-432 tests');
    // TODO: figure out how we can import from db/user without
    // playwright complaining about it
    await prisma.user.delete({
      where: {
        email: POLY_432_TESTS_EMAIL
      }
    });
  });

  test('do not see account created message on regular navigation', async ({ page }) => {
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
    await page.goto('/register');

    await page.getByLabel('username').fill('test');
    await page.getByLabel('email').fill(POLY_432_TESTS_EMAIL);
    await page.getByPlaceholder('Password', { exact: true }).fill('test');
    await page.getByPlaceholder('Repeat Password', { exact: true }).fill('test');
    await page.getByRole('button', { name: 'Create Account!' }).click();

    await expect(page).toHaveURL(/.*login/);
    expect(await page.textContent('h2')).toBe('Sign In');
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toHaveText(
      'Account successfully created! Please login.'
    );

    // message disappears on refresh
    await page.reload();
    await expect(page.locator('.alert-success')).not.toBeVisible();
  });
});
