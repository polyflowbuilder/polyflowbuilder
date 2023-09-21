import { expect, test } from '@playwright/test';
import { createUser, deleteUser } from '$lib/server/db/user';
import { performLoginFrontend } from 'tests/util/userTestUtil';

// bug description: modals fail to open when navigating to the
// flow editor for the second time (e.g. first time works, then navigate away,
// then on second load it doesn't work)

const GH_ISSUE_38_TESTS_EMAIL = 'pfb_test_gh-issue-38_playwright@test.com';

test.describe('gh-issue-38 bugfix tests', () => {
  test.beforeAll(async () => {
    // create account
    await createUser({
      email: GH_ISSUE_38_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });
  });

  test.beforeEach(async ({ page }) => {
    await performLoginFrontend(page, GH_ISSUE_38_TESTS_EMAIL, 'test');
  });

  test.afterAll(async () => {
    await deleteUser(GH_ISSUE_38_TESTS_EMAIL);
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
