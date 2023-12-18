import { expect } from '@playwright/test';
import type { Locator, Page, TestInfo } from '@playwright/test';

// manual drag-and-drop for svelte-dnd-action elements
// need to emulate manual dragging (maybe svelte-dnd-action quirks)
// locatorDragTarget is either a locator or [xOffset, yOffset] from locatorToDrag
export async function dragAndDrop(options: {
  page: Page;
  testInfo: TestInfo;
  locatorToDrag: Locator;
  locatorDragTarget: Locator | [number, number];
  verifyServerPersistedDrag?: boolean;
}) {
  const locatorToDragBBox = await options.locatorToDrag.boundingBox();
  if (!locatorToDragBBox) {
    throw new Error(
      'locatorToDrag bounding box not visible and accessible (probably need to scroll into view)'
    );
  }

  const srcX = locatorToDragBBox.x + locatorToDragBBox.width / 2;
  const srcY = locatorToDragBBox.y + locatorToDragBBox.height / 2;

  let destX: number;
  let destY: number;

  if (options.locatorDragTarget instanceof Array) {
    destX = srcX + options.locatorDragTarget[0];
    destY = srcY + options.locatorDragTarget[1];
  } else {
    const locatorDragTargetBBox = await options.locatorDragTarget.boundingBox();

    if (!locatorDragTargetBBox) {
      throw new Error(
        'locatorDragTarget bounding box not visible and accessible (probably need to scroll into view)'
      );
    }

    destX = locatorDragTargetBBox.x + locatorDragTargetBBox.width / 2;
    destY = locatorDragTargetBBox.y + locatorDragTargetBBox.height / 2;
  }

  // need to manually emulate mouse movement for successful drags (maybe svelte-dnd-action quirk)
  // use center of element so we guarantee that we're grabbing the element
  // (e.g. so we don't miss if we grab corner and it has a border radius)
  await options.page.mouse.move(srcX, srcY);
  await options.page.mouse.down();

  // if tests are not performing as expected, bump up drag resolution via step count
  const steps = 50 * 2 ** options.testInfo.retry;
  await options.page.mouse.move(destX, destY, { steps });

  // wait for at least flipDurationMs in MutableForEachContainer
  // adjust as appropriate
  await options.page.waitForTimeout(300);

  // verify that changes are committed after drag operation completed
  if (options.verifyServerPersistedDrag !== false) {
    const responsePromise = options.page.waitForResponse(/\/api\/user\/data\/updateUserFlowcharts/);
    await options.page.mouse.up();
    const response = await responsePromise;
    expect(response.ok()).toBe(true);
  } else {
    await options.page.mouse.up();
  }
}

export async function skipWelcomeMessage(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('pfb_welcomeModalOpened', 'true');
  });
}
