import type { Locator, Page } from '@playwright/test';

// manual drag-and-drop for svelte-dnd-action elements
// need to emulate manual dragging (maybe svelte-dnd-action quirks)
// locatorDragTarget is either a locator or [xOffset, yOffset] from locatorToDrag
export async function dragAndDrop(
  page: Page,
  locatorToDrag: Locator,
  locatorDragTarget: Locator | [number, number],
  doEndClick = true
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
  await page.mouse.move(destX, destY, { steps: 50 });
  await page.mouse.up();

  // need this to 'reset the drag' for some reason (maybe svelte-dnd-action quirk, see traces w/o this)
  if (doEndClick) {
    await locatorToDrag.click();
  }
}
