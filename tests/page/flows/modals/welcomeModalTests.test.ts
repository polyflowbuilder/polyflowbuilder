import { expect, test } from '@playwright/test';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginFrontend } from '$test/util/userTestUtil';

test.describe('welcome modal tests', () => {
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_flowsPage_modal_welcome_playwright@test.com',
      testInfo
    );
    await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });
  });

  test.beforeEach(async ({ page }) => {
    await performLoginFrontend(page, userEmail, 'test');
  });

  test.afterAll(async () => {
    await deleteUser(userEmail);
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
});
