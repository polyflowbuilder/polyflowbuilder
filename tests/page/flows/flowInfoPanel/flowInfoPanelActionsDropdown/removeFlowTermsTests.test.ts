import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { skipWelcomeMessage } from 'tests/util/frontendInteractionUtil';
import { populateFlowcharts } from 'tests/util/userDataTestUtil';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginFrontend } from 'tests/util/userTestUtil';

test.describe('remove flowchart terms tests', () => {
  test.describe.configure({ mode: 'serial' });
  const prisma = new PrismaClient();
  let userId: string;
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_flowsPage_remove_terms_modal_playwright@test.com',
      testInfo
    );
    const id = await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null');
    }

    userId = id;

    // populate some flowcharts
    await populateFlowcharts(prisma, userId, 2, [
      {
        idx: 0,
        info: {
          longTermCount: 0,
          termCount: 6
        }
      },
      {
        idx: 1,
        info: {
          longTermCount: 0,
          termCount: 10
        }
      }
    ]);
  });

  test.beforeEach(async ({ page }) => {
    await skipWelcomeMessage(page);
    await performLoginFrontend(page, userEmail, 'test');
  });

  test.afterAll(async () => {
    await deleteUser(userEmail);
  });

  test('remove flowchart terms default state correct', async ({ page }) => {
    // make sure we can open modal when a flowcahrt is selected and that it's currently closed

    // cannot access when no flowchart is selected
    await expect(page.getByText('Remove Flowchart Terms')).not.toBeVisible();
    await expect(
      page.getByText('Actions', {
        exact: true
      })
    ).not.toBeEnabled();
  });
});
