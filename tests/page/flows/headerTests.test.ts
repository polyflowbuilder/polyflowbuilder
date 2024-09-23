import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { skipWelcomeMessage } from '$test/util/frontendInteractionUtil';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginFrontend } from '$test/util/userTestUtil';

test.describe('flows page header tests', () => {
  test.describe.configure({ mode: 'serial' });
  const prisma = new PrismaClient();
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString('pfb_test_flowsPage_header_playwright@test.com', testInfo);
    await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });
  });

  test.beforeEach(async ({ page }) => {
    await skipWelcomeMessage(page);
    await performLoginFrontend(page, userEmail, 'test');
  });

  test.afterAll(async () => {
    await deleteUser(userEmail);
  });

  test('logout functionality performs redirect', async ({ page }) => {
    await page.locator('.avatar').click();
    await page.getByText('Log Out').click();

    await expect(page).toHaveURL('/');
    expect((await page.textContent('h1'))?.trim()).toBe('Welcome to PolyFlowBuilder!');

    // check cookies
    expect((await page.context().cookies()).length).toBe(0);

    // check header
    await expect(page.getByText('Sign In')).toBeVisible();
  });

  test('user able to open welcome modal from header dropdown', async ({ page }) => {
    // open in header
    await page.getByRole('img', { name: 'user' }).click();
    await page.getByText('View Welcome Message', { exact: true }).click();

    // expect modal to be visible
    await expect(page.getByText('Welcome to PolyFlowBuilder!')).toBeVisible();
    await page.getByText('Welcome to PolyFlowBuilder!').scrollIntoViewIfNeeded();
    await expect(page.getByText('Welcome to PolyFlowBuilder!')).toBeInViewport();
  });

  // make sure this test is AT THE VERY END! since account will be deleted
  test('delete account functionality works as expected', async ({ page }) => {
    // clicking the cancel button does not redirect or delete
    await page.locator('.avatar').click();
    await page.getByText('Delete Account').click();

    // check that we're still on the same page
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.context().cookies())[0].name).toBe('sId');

    // then confirm the delete
    page.on('dialog', (dialog) => {
      dialog.accept().catch(() => {
        throw new Error('accepting dialog failed');
      });
    });
    await page.locator('.avatar').click();
    await page.getByText('Delete Account').click();

    await expect(page).toHaveURL('/');
    expect((await page.textContent('h1'))?.trim()).toBe('Welcome to PolyFlowBuilder!');

    // check cookies
    expect((await page.context().cookies()).length).toBe(0);

    // check header
    await expect(page.getByText('Sign In')).toBeVisible();

    // check that account was deleted
    const res = await prisma.user.findFirst({
      where: {
        email: userEmail
      }
    });
    expect(res).toBeFalsy();
  });
});
