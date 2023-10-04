import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { skipWelcomeMessage } from 'tests/util/frontendInteractionUtil';
import { populateFlowcharts } from 'tests/util/userDataTestUtil';
import { createUser, deleteUser } from '$lib/server/db/user';
import { FLOW_LIST_ITEM_SELECTOR } from 'tests/util/selectorTestUtil';
import { getUserEmailString, performLoginFrontend } from 'tests/util/userTestUtil';
import type { Page } from '@playwright/test';

async function computeTotalUnitDistance(page: Page) {
  const footerElem = page.locator('#flowEditorFooter');
  const footerTotalElem = page.locator('#flowEditorFooterTotal');

  const footerElemWidth = (await footerElem.boundingBox())?.width;
  const footerTotalElemWidth = (await footerTotalElem.boundingBox())?.width;

  if (!footerElemWidth || !footerTotalElemWidth) {
    throw new Error('widths are undefined');
  }

  const totalUnitDistance = Math.floor(footerElemWidth - footerTotalElemWidth);
  return totalUnitDistance;
}

async function computeDistanceToShrink(page: Page) {
  const footerGroupElem = page.locator('#flowEditorFooterGroup');

  const footerGroupElemWidth = (await footerGroupElem.boundingBox())?.width;

  if (!footerGroupElemWidth) {
    throw new Error('widths are undefined');
  }

  const distance = Math.floor((await computeTotalUnitDistance(page)) - footerGroupElemWidth);
  return distance;
}

test.describe('flow page footer tests', () => {
  const prisma = new PrismaClient();
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString('pfb_test_flowsPage_footer_playwright@test.com', testInfo);
    const id = await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null');
    }

    // create flowchart to mess around in
    await populateFlowcharts(prisma, id, 1, [
      {
        idx: 0,
        info: {
          termCount: 8,
          longTermCount: 0
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

  test('flow footer resizing works properly', async ({ page }) => {
    // make sure browser is wide enough for full width
    await page.setViewportSize({ width: 1920, height: 720 });
    // load flowchart
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(1);
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    const unitCounterSquareLocators = page.locator('.unitCounterSquare');
    const unitCounterSquareCounts = await unitCounterSquareLocators.count();

    // expect to see full unit counters
    await expect(page.getByText('Major: 32')).toBeVisible();
    await expect(page.getByText('Major: 32')).toBeInViewport();
    await expect(page.getByText('Support: 8')).toBeVisible();
    await expect(page.getByText('Support: 8')).toBeInViewport();
    await expect(page.getByText('Concentration #1: 24')).toBeVisible();
    await expect(page.getByText('Concentration #1: 24')).toBeInViewport();
    await expect(page.getByText('Concentration #2: 0')).toBeVisible();
    await expect(page.getByText('Concentration #2: 0')).toBeInViewport();
    await expect(page.getByText('GE: 0')).toBeVisible();
    await expect(page.getByText('GE: 0')).toBeInViewport();
    await expect(page.getByText('Free Elective: 0')).toBeVisible();
    await expect(page.getByText('Free Elective: 0')).toBeInViewport();
    await expect(page.getByText('Other: 40')).toBeVisible();
    await expect(page.getByText('Other: 40')).toBeInViewport();

    // do it this way bc this 'hidden' class for unitCounterSquare
    // just makes it have size 0, so counting them would still return 7
    for (let i = 0; i < unitCounterSquareCounts; i += 1) {
      await expect(unitCounterSquareLocators.nth(i)).toBeVisible();
      await expect(unitCounterSquareLocators.nth(i)).toBeInViewport();
    }

    await expect(page.getByText('Total Units: 104')).toBeVisible();
    await expect(page.getByText('Total Units: 104')).toBeInViewport();

    // then resize to just after resize limit
    const distanceToShrink1 = await computeDistanceToShrink(page);

    await page.setViewportSize({
      width: 1920 - distanceToShrink1,
      height: 720
    });

    // then expect to see only numbers
    await expect(page.getByText('Major: 32')).not.toBeVisible();
    await expect(page.getByText('Major: 32')).not.toBeInViewport();
    await expect(page.getByText('Support: 8')).not.toBeVisible();
    await expect(page.getByText('Support: 8')).not.toBeInViewport();
    await expect(page.getByText('Concentration #1: 24')).not.toBeVisible();
    await expect(page.getByText('Concentration #1: 24')).not.toBeInViewport();
    await expect(page.getByText('Concentration #2: 0')).not.toBeVisible();
    await expect(page.getByText('Concentration #2: 0')).not.toBeInViewport();
    await expect(page.getByText('GE: 0')).not.toBeVisible();
    await expect(page.getByText('GE: 0')).not.toBeInViewport();
    await expect(page.getByText('Free Elective: 0')).not.toBeVisible();
    await expect(page.getByText('Free Elective: 0')).not.toBeInViewport();
    await expect(page.getByText('Other: 40')).not.toBeVisible();
    await expect(page.getByText('Other: 40')).not.toBeInViewport();

    // do it this way bc this 'hidden' class for unitCounterSquare
    // just makes it have size 0, so counting them would still return 7
    for (let i = 0; i < unitCounterSquareCounts; i += 1) {
      await expect(unitCounterSquareLocators.nth(i)).toBeVisible();
      await expect(unitCounterSquareLocators.nth(i)).toBeInViewport();
    }

    await expect(page.getByText('Total Units: 104')).toBeVisible();
    await expect(page.getByText('Total Units: 104')).toBeInViewport();

    // then resize to just after resize limit again
    const distanceToShrink2 = await computeDistanceToShrink(page);

    await page.setViewportSize({
      width: 1920 - distanceToShrink1 - distanceToShrink2,
      height: 720
    });

    // then expect to see just 'total units'
    await expect(page.getByText('Major: 32')).not.toBeVisible();
    await expect(page.getByText('Major: 32')).not.toBeInViewport();
    await expect(page.getByText('Support: 8')).not.toBeVisible();
    await expect(page.getByText('Support: 8')).not.toBeInViewport();
    await expect(page.getByText('Concentration #1: 24')).not.toBeVisible();
    await expect(page.getByText('Concentration #1: 24')).not.toBeInViewport();
    await expect(page.getByText('Concentration #2: 0')).not.toBeVisible();
    await expect(page.getByText('Concentration #2: 0')).not.toBeInViewport();
    await expect(page.getByText('GE: 0')).not.toBeVisible();
    await expect(page.getByText('GE: 0')).not.toBeInViewport();
    await expect(page.getByText('Free Elective: 0')).not.toBeVisible();
    await expect(page.getByText('Free Elective: 0')).not.toBeInViewport();
    await expect(page.getByText('Other: 40')).not.toBeVisible();
    await expect(page.getByText('Other: 40')).not.toBeInViewport();

    // do it this way bc this 'hidden' class for unitCounterSquare
    // just makes it have size 0, so counting them would still return 7
    for (let i = 0; i < unitCounterSquareCounts; i += 1) {
      await expect(unitCounterSquareLocators.nth(i)).not.toBeVisible();
      await expect(unitCounterSquareLocators.nth(i)).not.toBeInViewport();
    }

    await expect(page.getByText('Total Units: 104')).toBeVisible();
    await expect(page.getByText('Total Units: 104')).toBeInViewport();

    // then resize again
    const distanceToShrink3 = await computeTotalUnitDistance(page);
    await page.setViewportSize({
      width: 1920 - distanceToShrink1 - distanceToShrink2 - distanceToShrink3,
      height: 720
    });

    // then expect to see nothing
    await expect(page.getByText('Major: 32')).not.toBeVisible();
    await expect(page.getByText('Major: 32')).not.toBeInViewport();
    await expect(page.getByText('Support: 8')).not.toBeVisible();
    await expect(page.getByText('Support: 8')).not.toBeInViewport();
    await expect(page.getByText('Concentration #1: 24')).not.toBeVisible();
    await expect(page.getByText('Concentration #1: 24')).not.toBeInViewport();
    await expect(page.getByText('Concentration #2: 0')).not.toBeVisible();
    await expect(page.getByText('Concentration #2: 0')).not.toBeInViewport();
    await expect(page.getByText('GE: 0')).not.toBeVisible();
    await expect(page.getByText('GE: 0')).not.toBeInViewport();
    await expect(page.getByText('Free Elective: 0')).not.toBeVisible();
    await expect(page.getByText('Free Elective: 0')).not.toBeInViewport();
    await expect(page.getByText('Other: 40')).not.toBeVisible();
    await expect(page.getByText('Other: 40')).not.toBeInViewport();

    // do it this way bc this 'hidden' class for unitCounterSquare
    // just makes it have size 0, so counting them would still return 7
    for (let i = 0; i < unitCounterSquareCounts; i += 1) {
      await expect(unitCounterSquareLocators.nth(i)).not.toBeVisible();
      await expect(unitCounterSquareLocators.nth(i)).not.toBeInViewport();
    }

    await expect(page.getByText('Total Units: 104')).not.toBeVisible();
    await expect(page.getByText('Total Units: 104')).not.toBeInViewport();

    // then do the same in reverse

    // increase so we can see just 'total units'
    await page.setViewportSize({
      width: 1920 - distanceToShrink1 - distanceToShrink2,
      height: 720
    });

    await expect(page.getByText('Major: 32')).not.toBeVisible();
    await expect(page.getByText('Major: 32')).not.toBeInViewport();
    await expect(page.getByText('Support: 8')).not.toBeVisible();
    await expect(page.getByText('Support: 8')).not.toBeInViewport();
    await expect(page.getByText('Concentration #1: 24')).not.toBeVisible();
    await expect(page.getByText('Concentration #1: 24')).not.toBeInViewport();
    await expect(page.getByText('Concentration #2: 0')).not.toBeVisible();
    await expect(page.getByText('Concentration #2: 0')).not.toBeInViewport();
    await expect(page.getByText('GE: 0')).not.toBeVisible();
    await expect(page.getByText('GE: 0')).not.toBeInViewport();
    await expect(page.getByText('Free Elective: 0')).not.toBeVisible();
    await expect(page.getByText('Free Elective: 0')).not.toBeInViewport();
    await expect(page.getByText('Other: 40')).not.toBeVisible();
    await expect(page.getByText('Other: 40')).not.toBeInViewport();

    // do it this way bc this 'hidden' class for unitCounterSquare
    // just makes it have size 0, so counting them would still return 7
    for (let i = 0; i < unitCounterSquareCounts; i += 1) {
      await expect(unitCounterSquareLocators.nth(i)).not.toBeVisible();
      await expect(unitCounterSquareLocators.nth(i)).not.toBeInViewport();
    }

    await expect(page.getByText('Total Units: 104')).toBeVisible();
    await expect(page.getByText('Total Units: 104')).toBeInViewport();

    // increase so we can see unit counter squares
    await page.setViewportSize({
      width: 1920 - distanceToShrink1,
      height: 720
    });

    await expect(page.getByText('Major: 32')).not.toBeVisible();
    await expect(page.getByText('Major: 32')).not.toBeInViewport();
    await expect(page.getByText('Support: 8')).not.toBeVisible();
    await expect(page.getByText('Support: 8')).not.toBeInViewport();
    await expect(page.getByText('Concentration #1: 24')).not.toBeVisible();
    await expect(page.getByText('Concentration #1: 24')).not.toBeInViewport();
    await expect(page.getByText('Concentration #2: 0')).not.toBeVisible();
    await expect(page.getByText('Concentration #2: 0')).not.toBeInViewport();
    await expect(page.getByText('GE: 0')).not.toBeVisible();
    await expect(page.getByText('GE: 0')).not.toBeInViewport();
    await expect(page.getByText('Free Elective: 0')).not.toBeVisible();
    await expect(page.getByText('Free Elective: 0')).not.toBeInViewport();
    await expect(page.getByText('Other: 40')).not.toBeVisible();
    await expect(page.getByText('Other: 40')).not.toBeInViewport();

    // do it this way bc this 'hidden' class for unitCounterSquare
    // just makes it have size 0, so counting them would still return 7
    for (let i = 0; i < unitCounterSquareCounts; i += 1) {
      await expect(unitCounterSquareLocators.nth(i)).toBeVisible();
      await expect(unitCounterSquareLocators.nth(i)).toBeInViewport();
    }

    await expect(page.getByText('Total Units: 104')).toBeVisible();
    await expect(page.getByText('Total Units: 104')).toBeInViewport();

    // increase so we can see everything
    await page.setViewportSize({
      width: 1920,
      height: 720
    });

    await expect(page.getByText('Major: 32')).toBeVisible();
    await expect(page.getByText('Major: 32')).toBeInViewport();
    await expect(page.getByText('Support: 8')).toBeVisible();
    await expect(page.getByText('Support: 8')).toBeInViewport();
    await expect(page.getByText('Concentration #1: 24')).toBeVisible();
    await expect(page.getByText('Concentration #1: 24')).toBeInViewport();
    await expect(page.getByText('Concentration #2: 0')).toBeVisible();
    await expect(page.getByText('Concentration #2: 0')).toBeInViewport();
    await expect(page.getByText('GE: 0')).toBeVisible();
    await expect(page.getByText('GE: 0')).toBeInViewport();
    await expect(page.getByText('Free Elective: 0')).toBeVisible();
    await expect(page.getByText('Free Elective: 0')).toBeInViewport();
    await expect(page.getByText('Other: 40')).toBeVisible();
    await expect(page.getByText('Other: 40')).toBeInViewport();

    // do it this way bc this 'hidden' class for unitCounterSquare
    // just makes it have size 0, so counting them would still return 7
    for (let i = 0; i < unitCounterSquareCounts; i += 1) {
      await expect(unitCounterSquareLocators.nth(i)).toBeVisible();
      await expect(unitCounterSquareLocators.nth(i)).toBeInViewport();
    }

    await expect(page.getByText('Total Units: 104')).toBeVisible();
    await expect(page.getByText('Total Units: 104')).toBeInViewport();
  });
});
