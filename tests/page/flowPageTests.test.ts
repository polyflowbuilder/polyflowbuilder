// NOTE: need ignores bc we need the .ts extension for Playwright
// see https://playwright.dev/docs/test-typescript#typescript-with-esm

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { createUserAccount, performLogin } from '../util/userTestUtil.ts';

import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import type { Page } from '@playwright/test';

const FLOWS_PAGE_TESTS_EMAIL = 'pfb_test_flowsPage_playwright@test.com';

test.describe('flows page tests', () => {
  test.describe.configure({ mode: 'serial' });
  let page: Page;
  const prisma = new PrismaClient();

  test.beforeAll(async ({ browser }) => {
    // create account
    await createUserAccount(FLOWS_PAGE_TESTS_EMAIL, 'test', 'test');

    // login
    // see https://playwright.dev/docs/auth#reuse-the-signed-in-page-in-multiple-tests
    page = await browser.newPage();
    await performLogin(page, FLOWS_PAGE_TESTS_EMAIL, 'test');
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

  // make sure this test is AT THE VERY END! since account will be deleted
  test('delete account functionality works as expected', async () => {
    // first login
    await performLogin(page, FLOWS_PAGE_TESTS_EMAIL, 'test');

    // clicking the cancel button does not redirect or delete
    await page.locator('.avatar').click();
    await page.getByText('Delete Account').click();

    // check that we're still on the same page
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.context().cookies())[0].name).toBe('sId');

    // then confirm the delete
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('.avatar').click();
    await page.getByText('Delete Account').click();

    await expect(page).toHaveURL('/');
    expect(await page.textContent('h1')).toBe('Welcome to PolyFlowBuilder!');

    // check cookies
    expect((await page.context().cookies()).length).toBe(0);

    // check header
    await expect(page.getByText('Sign In')).toBeVisible();

    // check that account was deleted
    const res = await prisma.user.findFirst({
      where: {
        email: FLOWS_PAGE_TESTS_EMAIL
      }
    });
    expect(res).toBeFalsy();
  });
});
