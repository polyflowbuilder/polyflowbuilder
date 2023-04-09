import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { populateFlowcharts } from '../../util/userDataTestUtil.js';
import { performLoginFrontend } from '../../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { FLOW_LIST_ITEM_SELECTOR } from '../../util/selectorTestUtil.js';
import type { Locator, Page } from '@playwright/test';

const FLOWS_PAGE_FLOW_LIST_TESTS_EMAIL = 'pfb_test_flowsPage_flow_list_playwright@test.com';

// manual drag-and-drop for svelte-dnd-action elements
// need to emulate manual dragging (maybe svelte-dnd-action quirks)
async function dragAndDrop(page: Page, locatorToDrag: Locator, locatorDragTarget: Locator) {
  const locatorToDragBBox = await locatorToDrag.boundingBox();
  const locatorDragTargetBBox = await locatorDragTarget.boundingBox();

  if (!locatorToDragBBox || !locatorDragTargetBBox) {
    throw new Error('bounding box not visible and accessible (probably need to scroll into view)');
  }

  // need to manually emulate mouse movement for successful drags (maybe svelte-dnd-action quirk)
  // use center of element so we guarantee that we're grabbing the element
  // (e.g. so we don't miss if we grab corner and it has a border radius)
  await page.mouse.move(
    locatorToDragBBox.x + locatorToDragBBox.width / 2,
    locatorToDragBBox.y + locatorToDragBBox.height / 2
  );
  await page.mouse.down();

  await page.mouse.move(
    locatorDragTargetBBox.x + locatorDragTargetBBox.width / 2,
    locatorDragTargetBBox.y + locatorDragTargetBBox.height / 2,
    {
      steps: 20
    }
  );
  await page.mouse.up();

  // need this to 'reset the drag' for some reason (maybe svelte-dnd-action quirk, see traces w/o this)
  await locatorToDrag.click();
}

test.describe('flow list tests', () => {
  let userId: string;
  const prisma = new PrismaClient();

  test.beforeAll(async () => {
    // create account
    const id = await createUser({
      email: FLOWS_PAGE_FLOW_LIST_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null when it should not be');
    }
    userId = id;
  });

  test.beforeEach(async ({ page }) => {
    await prisma.dBFlowchart.deleteMany({
      where: {
        ownerId: userId
      }
    });

    await performLoginFrontend(page, FLOWS_PAGE_FLOW_LIST_TESTS_EMAIL, 'test');
  });

  test.afterAll(async () => {
    await deleteUser(FLOWS_PAGE_FLOW_LIST_TESTS_EMAIL);
  });

  test('ui for empty flows list correct', async ({ page }) => {
    await expect(page.getByText('You do not have any flows. Start by creating one!')).toBeVisible();
    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).toBeInViewport();
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(0);
  });

  test('ui for single flowchart in flow list correct', async ({ page }) => {
    // populate with a single flowchart
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
    // populate with more flowcharts
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
    // populate with more flowcharts
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

  test('reordering flows in flow list correct', async ({ page }) => {
    // populate with more flowcharts
    await populateFlowcharts(prisma, userId, 4);
    await page.reload();

    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).not.toBeVisible();
    // selector for a flowlistitem
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
});
