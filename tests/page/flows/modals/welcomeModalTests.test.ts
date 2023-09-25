import { expect, test } from '@playwright/test';
import { performLoginFrontend } from 'tests/util/userTestUtil';
import { createUser, deleteUser } from '$lib/server/db/user';

const FLOWS_PAGE_MODAL_WELCOME_TESTS_EMAIL = 'pfb_test_flowsPage_modal_welcome_playwright@test.com';

test.describe('welcome modal tests', () => {
  test.beforeAll(async () => {
    // create account
    await createUser({
      email: FLOWS_PAGE_MODAL_WELCOME_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });
  });

  test.beforeEach(async ({ page }) => {
    await performLoginFrontend(page, FLOWS_PAGE_MODAL_WELCOME_TESTS_EMAIL, 'test');
  });

  test.afterAll(async () => {
    await deleteUser(FLOWS_PAGE_MODAL_WELCOME_TESTS_EMAIL);
  });

  test('modal appears on first login and then does not reappear', async ({ page }) => {
    // expect modal to be visible
    await expect(page.getByText('Welcome to PolyFlowBuilder!')).toBeVisible();
    await expect(page.getByText('Welcome to PolyFlowBuilder!')).toBeInViewport();

    // then close
    await page.getByRole('button', { name: 'Close' }).click();

    // reload and expect modal to not be visible
    await page.reload();

    await expect(page.getByText('Welcome to PolyFlowBuilder!')).not.toBeVisible();
  });

  test('modal does not appear when localStorage key is set', async ({ page }) => {
    // set localstorage key
    await page.evaluate(() => {
      window.localStorage.setItem('pfb_welcomeModalOpened', 'true');
    });

    // reload and expect modal to not be visible
    await page.reload();

    await expect(page.getByText('Welcome to PolyFlowBuilder!')).not.toBeVisible();
  });

  test('user able to open modal again after closing', async ({ page }) => {
    // expect modal to be visible
    await expect(page.getByText('Welcome to PolyFlowBuilder!')).toBeVisible();
    await expect(page.getByText('Welcome to PolyFlowBuilder!')).toBeInViewport();

    // then close
    await page.getByRole('button', { name: 'Close' }).click();

    // then open again
    await page.getByRole('img', { name: 'user' }).click();
    await page.getByText('View Welcome Message', { exact: true }).click();

    // expect modal to be visible again
    await expect(page.getByText('Welcome to PolyFlowBuilder!')).toBeVisible();
    await page.getByText('Welcome to PolyFlowBuilder!').scrollIntoViewIfNeeded();
    await expect(page.getByText('Welcome to PolyFlowBuilder!')).toBeInViewport();
  });
});
