import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { getUserFlowcharts } from '$lib/server/db/flowchart';
import { populateFlowcharts } from '../../util/userDataTestUtil.js';
import { performLoginFrontend } from '../../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import {
  FLOW_LIST_ITEM_SELECTED_SELECTOR,
  FLOW_LIST_ITEM_SELECTOR
} from '../../util/selectorTestUtil.js';
import type { Page } from '@playwright/test';

const FLOWS_PAGE_DELETE_FLOW_TESTS_EMAIL = 'pfb_test_flowPage_deleteFlow_playwright@test.com';

async function assertCorrectFailureHandling(page: Page, dialogMessage: string) {
  let lastDialogMessage = '';
  page.on('dialog', (dialog) => {
    // multiple dialogs pop up (confirmation and unauthorized),
    // but we only care about the last one
    lastDialogMessage = dialog.message();
    dialog.accept().catch(() => {
      throw new Error('accepting dialog failed');
    });
  });

  const originalCount = await page.locator(FLOW_LIST_ITEM_SELECTOR).count();
  expect(originalCount).toBeGreaterThanOrEqual(1);

  // no flow should be selected
  await expect(page.getByText('Delete Flow')).toBeDisabled();
  await expect(page.locator(FLOW_LIST_ITEM_SELECTED_SELECTOR)).toHaveCount(0);

  // select a flow, delete option should be available
  await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0).click();
  await expect(page.getByText('Delete Flow')).toBeEnabled();

  // confirm delete
  await page.getByText('Delete Flow').click();

  // make sure popup came up telling us that this was unauthenticated
  await new Promise((r) => setTimeout(r, 500));
  expect(lastDialogMessage).toBe(dialogMessage);

  // check state
  await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(originalCount);
  await page.reload();
  await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(originalCount);
}

async function assertCorrectFlowDelete(
  page: Page,
  userId: string,
  deleteIdx: number,
  expectList: string[]
) {
  // no flow should be selected
  await expect(page.getByText('Delete Flow')).toBeDisabled();
  await expect(page.locator(FLOW_LIST_ITEM_SELECTED_SELECTOR)).toHaveCount(0);

  // select a flow, delete option should be available
  await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(deleteIdx).click();
  await expect(page.getByText('Delete Flow')).toBeEnabled();

  // confirm delete
  await page.getByText('Delete Flow').click();

  // check state
  await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText(expectList);

  // no flow should be selected
  await expect(page.getByText('Delete Flow')).toBeDisabled();
  await expect(page.locator(FLOW_LIST_ITEM_SELECTED_SELECTOR)).toHaveCount(0);

  // refresh to test persistence
  await page.reload();

  // check state
  await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText(expectList);

  // verify that the position idxs in db have been updated correctly
  const flows = await getUserFlowcharts(userId);
  for (let i = 0; i < flows.length; i += 1) {
    expect(flows[i].pos).toBe(i);
  }
}

test.describe('flow delete tests', () => {
  const prisma = new PrismaClient();
  let userId: string;

  test.beforeAll(async () => {
    // create account
    const id = await createUser({
      email: FLOWS_PAGE_DELETE_FLOW_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null');
    }

    userId = id;

    // create flowcharts to mess around in
    await populateFlowcharts(prisma, userId, 4);
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(FLOWS_PAGE_DELETE_FLOW_TESTS_EMAIL);
  });

  test('user able to delete flowchart', async ({ page }) => {
    page.on('dialog', (dialog) => {
      dialog.accept().catch(() => {
        throw new Error('accepting dialog failed');
      });
    });

    await performLoginFrontend(page, FLOWS_PAGE_DELETE_FLOW_TESTS_EMAIL, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // make sure test flows exist
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3'
    ]);

    // do deletes in random order, making sure things are correct as we go
    await assertCorrectFlowDelete(page, userId, 0, ['test flow 1', 'test flow 2', 'test flow 3']);
    await assertCorrectFlowDelete(page, userId, 1, ['test flow 1', 'test flow 3']);
    await assertCorrectFlowDelete(page, userId, 1, ['test flow 1']);

    // keep at least one flowchart present for other tests in case this one runs first
  });

  test('401 case handled properly', async ({ page }) => {
    await page.route(/\/api\/user\/data\/updateUserFlowcharts/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Request was unauthenticated. Please authenticate and try again.'
        })
      });
    });

    await performLoginFrontend(page, FLOWS_PAGE_DELETE_FLOW_TESTS_EMAIL, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // do the test
    await assertCorrectFailureHandling(
      page,
      'ERROR: You were not authorized to perform the most recent flow data change. Please refresh the page and re-authenticate.'
    );
  });

  test('400 case handled properly', async ({ page }) => {
    await page.route(/\/api\/user\/data\/updateUserFlowcharts/, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Invalid input received.'
        })
      });
    });

    await performLoginFrontend(page, FLOWS_PAGE_DELETE_FLOW_TESTS_EMAIL, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    await assertCorrectFailureHandling(
      page,
      'ERROR: The server reported an error on data modification. This means that your most recent changes were not saved. Please reload the page to ensure that no data has been lost.'
    );
  });

  test('500 case handled properly', async ({ page }) => {
    await page.route(/\/api\/user\/data\/updateUserFlowcharts/, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'An error occurred while updating user flowcharts, please try again a bit later.'
        })
      });
    });

    await performLoginFrontend(page, FLOWS_PAGE_DELETE_FLOW_TESTS_EMAIL, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    await assertCorrectFailureHandling(
      page,
      'ERROR: The server reported an error on data modification. This means that your most recent changes were not saved. Please reload the page to ensure that no data has been lost.'
    );
  });
});
