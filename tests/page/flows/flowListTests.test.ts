import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { populateFlowcharts } from 'tests/util/userDataTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { dragAndDrop, skipWelcomeMessage } from 'tests/util/frontendInteractionUtil.js';
import { getUserEmailString, performLoginFrontend } from 'tests/util/userTestUtil.js';
import {
  FLOW_LIST_ITEM_SELECTOR,
  FLOW_LIST_ITEM_SELECTED_SELECTOR
} from 'tests/util/selectorTestUtil.js';

test.describe('flow list tests', () => {
  let userId: string;
  let userEmail: string;
  const prisma = new PrismaClient();

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString('pfb_test_flowsPage_flow_list_playwright@test.com', testInfo);
    const id = await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null when it should not be');
    }
    userId = id;
  });

  test.beforeEach(async ({ page }) => {
    await skipWelcomeMessage(page);
    await prisma.dBFlowchart.deleteMany({
      where: {
        ownerId: userId
      }
    });

    await performLoginFrontend(page, userEmail, 'test');
  });

  test.afterAll(async () => {
    await deleteUser(userEmail);
  });

  test('ui for empty flows list correct', async ({ page }) => {
    await expect(page.getByText('You do not have any flows. Start by creating one!')).toBeVisible();
    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).toBeInViewport();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(0);
  });

  test('ui for single flowchart in flow list correct', async ({ page }) => {
    await populateFlowcharts(prisma, userId, 1);
    await page.reload();

    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).not.toBeVisible();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(1);

    await expect(page.getByText('test flow 0')).toBeVisible();
    await expect(page.getByText('test flow 0')).toBeInViewport();
  });

  test('ui for multiple flows in flow list correct (no overflow)', async ({ page }) => {
    await populateFlowcharts(prisma, userId, 3);
    await page.reload();

    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).not.toBeVisible();
    // selector for a flowlistitem
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(3);

    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2'
    ]);

    await expect(page.getByText('test flow 0')).toBeVisible();
    await expect(page.getByText('test flow 0')).toBeInViewport();
    await expect(page.getByText('test flow 1')).toBeVisible();
    await expect(page.getByText('test flow 1')).toBeInViewport();
    await expect(page.getByText('test flow 2')).toBeVisible();
    await expect(page.getByText('test flow 2')).toBeInViewport();
  });

  test('ui for multiple flows in flow list correct (overflow)', async ({ page }) => {
    await populateFlowcharts(prisma, userId, 10);
    await page.reload();

    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).not.toBeVisible();
    // selector for a flowlistitem
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(10);

    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3',
      'test flow 4',
      'test flow 5',
      'test flow 6',
      'test flow 7',
      'test flow 8',
      'test flow 9'
    ]);

    // 8 flow list items are visible w default test resolution
    await expect(page.getByText('test flow 0')).toBeVisible();
    await expect(page.getByText('test flow 0')).toBeInViewport();
    await expect(page.getByText('test flow 1')).toBeVisible();
    await expect(page.getByText('test flow 1')).toBeInViewport();
    await expect(page.getByText('test flow 2')).toBeVisible();
    await expect(page.getByText('test flow 2')).toBeInViewport();
    await expect(page.getByText('test flow 3')).toBeVisible();
    await expect(page.getByText('test flow 3')).toBeInViewport();
    await expect(page.getByText('test flow 4')).toBeVisible();
    await expect(page.getByText('test flow 4')).toBeInViewport();
    await expect(page.getByText('test flow 5')).toBeVisible();
    await expect(page.getByText('test flow 5')).toBeInViewport();
    await expect(page.getByText('test flow 6')).toBeVisible();
    await expect(page.getByText('test flow 6')).toBeInViewport();
    await expect(page.getByText('test flow 7')).toBeVisible();
    await expect(page.getByText('test flow 7')).toBeInViewport();

    // so these should be hidden
    await expect(page.getByText('test flow 8')).toBeVisible();
    await expect(page.getByText('test flow 8')).not.toBeInViewport();
    await expect(page.getByText('test flow 9')).toBeVisible();
    await expect(page.getByText('test flow 9')).not.toBeInViewport();
  });

  test('reordering flows in flow list correct', async ({ page }, testInfo) => {
    await populateFlowcharts(prisma, userId, 4);
    await page.reload();

    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).not.toBeVisible();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(4);

    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3'
    ]);

    // now drag and drop to reorder
    await dragAndDrop(
      page,
      testInfo,
      page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0),
      page.locator(FLOW_LIST_ITEM_SELECTOR).nth(1)
    );

    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 1',
      'test flow 0',
      'test flow 2',
      'test flow 3'
    ]);

    // expect state to be the same after a reload (testing persistence)
    await page.reload();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 1',
      'test flow 0',
      'test flow 2',
      'test flow 3'
    ]);

    // then reorder further and test persistence again
    await dragAndDrop(
      page,
      testInfo,
      page.locator(FLOW_LIST_ITEM_SELECTOR).nth(1),
      page.locator(FLOW_LIST_ITEM_SELECTOR).nth(3)
    );

    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 1',
      'test flow 2',
      'test flow 3',
      'test flow 0'
    ]);

    await page.reload();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 1',
      'test flow 2',
      'test flow 3',
      'test flow 0'
    ]);
  });

  test('dragging but not reordering flows works as expected (poly-533)', async ({
    page
  }, testInfo) => {
    await populateFlowcharts(prisma, userId, 4);
    await page.reload();

    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).not.toBeVisible();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(4);

    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3'
    ]);

    // now drag and drop but don't reorder
    const locator = await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0).boundingBox();
    if (!locator) {
      throw new Error('locator null');
    }
    await dragAndDrop(page, testInfo, page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0), [0, 25]);

    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3'
    ]);

    // now drag and drop and reorder
    await dragAndDrop(
      page,
      testInfo,
      page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0),
      page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2)
    );

    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 1',
      'test flow 2',
      'test flow 0',
      'test flow 3'
    ]);
  });

  test('flow selection works', async ({ page }, testInfo) => {
    await populateFlowcharts(prisma, userId, 4);
    await page.reload();

    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).not.toBeVisible();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(4);

    // no flow should be selected
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3'
    ]);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTED_SELECTOR)).toHaveCount(0);

    // click on a flow and expect it to be selected (a few times)
    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0).click();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTED_SELECTOR)).toHaveCount(1);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0)).toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(1)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(3)).not.toHaveClass(/selected/);

    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(3).click();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTED_SELECTOR)).toHaveCount(1);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(1)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(3)).toHaveClass(/selected/);

    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(1).click();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTED_SELECTOR)).toHaveCount(1);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(1)).toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(3)).not.toHaveClass(/selected/);

    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2).click();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTED_SELECTOR)).toHaveCount(1);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(1)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2)).toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(3)).not.toHaveClass(/selected/);

    // now drag something around and expect selection to reset
    await dragAndDrop(
      page,
      testInfo,
      page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0),
      page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2),
      false
    );

    await expect(page.locator(FLOW_LIST_ITEM_SELECTED_SELECTOR)).toHaveCount(0);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(0)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(1)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2)).not.toHaveClass(/selected/);
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).nth(3)).not.toHaveClass(/selected/);
  });
});
