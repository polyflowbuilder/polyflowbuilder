import type { Locator, Page, TestInfo } from '@playwright/test';

// manual drag-and-drop for svelte-dnd-action elements
// need to emulate manual dragging (maybe svelte-dnd-action quirks)
// locatorDragTarget is either a locator or [xOffset, yOffset] from locatorToDrag
export async function dragAndDrop(
  page: Page,
  testInfo: TestInfo,
  locatorToDrag: Locator,
  locatorDragTarget: Locator | [number, number]
) {
  const locatorToDragBBox = await locatorToDrag.boundingBox();
  if (!locatorToDragBBox) {
    throw new Error(
      'locatorToDrag bounding box not visible and accessible (probably need to scroll into view)'
    );
  }

  const srcX = locatorToDragBBox.x + locatorToDragBBox.width / 2;
  const srcY = locatorToDragBBox.y + locatorToDragBBox.height / 2;

  let destX: number;
  let destY: number;

  if (locatorDragTarget instanceof Array) {
    destX = srcX + locatorDragTarget[0];
    destY = srcY + locatorDragTarget[1];
  } else {
    const locatorDragTargetBBox = await locatorDragTarget.boundingBox();

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
  await page.mouse.move(srcX, srcY);
  await page.mouse.down();

  // if tests are not performing as expected, bump up drag resolution via step count
  const steps = (testInfo.project.name === 'webkit' ? 2000 : 50) * 2 ** testInfo.retry;
  await page.mouse.move(destX, destY, { steps });

  // wait for at least flipDurationMs in MutableForEachContainer
  // adjust as appropriate (same with second timeout)
  await page.waitForTimeout(300);

  await page.mouse.up();

  // if tests are not performing as expected, bump up timeout to let elements "settle" in headless mode
  await page.waitForTimeout(300);
}

export async function skipWelcomeMessage(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('pfb_welcomeModalOpened', 'true');
  });
}
