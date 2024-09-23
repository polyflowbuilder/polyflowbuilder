import { expect, test } from '@playwright/test';
import { skipWelcomeMessage } from '../util/frontendInteractionUtil';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginFrontend } from '../util/userTestUtil';

// bug description: modals fail to open when navigating to the
// flow editor for the second time (e.g. first time works, then navigate away,
// then on second load it doesn't work)

test.describe('gh-issue-38 bugfix tests', () => {
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString('pfb_test_gh-issue-38_playwright@test.com', testInfo);
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

  test('able to open modals on first load', async ({ page }) => {
    // try opening a modal
    await expect(page.getByText('Create New Flowchart')).not.toBeVisible();
    await page.getByRole('button', { name: 'New Flow' }).click();
    await expect(page.getByText('Create New Flowchart')).toBeVisible();
  });

  test('able to open modals on second load', async ({ page }) => {
    // try opening a modal for the first time
    await expect(page.getByText('Create New Flowchart')).not.toBeVisible();
    await page.getByRole('button', { name: 'New Flow' }).click();
    await expect(page.getByText('Create New Flowchart')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    // navigate to another page
    await page.getByRole('link', { name: 'Submit Feedback' }).click();

    // go back to flows
    await page.getByRole('img', { name: 'PolyFlowBuilder logo' }).click();

    // expect to open the same modal again a second time
    await expect(page.getByText('Create New Flowchart')).not.toBeVisible();
    await page.getByRole('button', { name: 'New Flow' }).click();
    await expect(page.getByText('Create New Flowchart')).toBeVisible();
  });
});
