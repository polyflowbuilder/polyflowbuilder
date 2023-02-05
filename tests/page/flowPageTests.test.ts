// NOTE: need ignores bc we need the .ts extension for Playwright
// see https://playwright.dev/docs/test-typescript#typescript-with-esm

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { createUserAccount, deleteUserAccount, performLogin } from '../util/userTestUtil.ts';

import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const FLOWS_PAGE_TESTS_EMAIL = 'pfb_test_flowsPage_playwright@test.com';

test.describe('flows page tests', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // create account
    await createUserAccount(FLOWS_PAGE_TESTS_EMAIL, 'test', 'test');

    // login
    // see https://playwright.dev/docs/auth#reuse-the-signed-in-page-in-multiple-tests
    page = await browser.newPage();
    await performLogin(page, FLOWS_PAGE_TESTS_EMAIL, 'test');
  });

  test.afterAll(async () => {
    // delete account
    await deleteUserAccount(FLOWS_PAGE_TESTS_EMAIL);
  });

  test('logout functionality performs redirect', async () => {
    await page.locator('.avatar').click();
    await page.getByText('Log Out').click();

    await expect(page).toHaveURL('/');
    expect(await page.textContent('h1')).toBe('Welcome to PolyFlowBuilder!');

    // check cookies
    expect((await page.context().cookies()).length).toBe(0);

    // check header
    await expect(page.getByText('Sign In')).toBeVisible();
  });
});
