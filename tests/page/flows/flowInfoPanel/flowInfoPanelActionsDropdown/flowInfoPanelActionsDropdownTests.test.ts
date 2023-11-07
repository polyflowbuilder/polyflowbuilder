import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { getUserFlowcharts } from '$lib/server/db/flowchart';
import { populateFlowcharts } from 'tests/util/userDataTestUtil';
import { skipWelcomeMessage } from 'tests/util/frontendInteractionUtil';
import { FLOW_TERM_COUNT_MAX } from '$lib/common/config/flowDataConfig';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginFrontend } from 'tests/util/userTestUtil';
import {
  FLOW_LIST_ITEM_SELECTOR,
  TERM_CONTAINER_SELECTOR,
  getTermContainerCourseLocator,
  TERM_CONTAINER_COURSES_SELECTOR
} from 'tests/util/selectorTestUtil';

// dropdown entries that open modals will be tested separately
test.describe('FlowInfoPanelActionsDropdown tests', () => {
  test.describe.configure({ mode: 'serial' });
  const prisma = new PrismaClient();
  let userId: string;
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_flowsPage_flowInfoPanelActionsDropdown_playwright@test.com',
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

    // populate a flowchart
    await populateFlowcharts(prisma, userId, 3, [
      {
        idx: 0,
        info: {
          termCount: 4,
          longTermCount: 0
        }
      },
      {
        idx: 1,
        info: {
          termCount: FLOW_TERM_COUNT_MAX,
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

  test('default dropdown state correct', async ({ page }) => {
    // make sure no flowchart is selected
    await expect(page.getByText('No flow selected. Please select or create a flow.')).toBeVisible();
    await expect(
      page.getByText('No flow selected. Please select or create a flow.')
    ).toBeInViewport();

    await expect(page.getByText('Actions')).toBeDisabled();

    // check that all dropdown items are also disabled
    await expect(
      page.getByText('Add Terms', {
        exact: true
      })
    ).toBeDisabled();
    await expect(
      page.getByText('Remove Terms', {
        exact: true
      })
    ).toBeDisabled();
    await expect(page.getByText('Edit Flow Properties')).toBeDisabled();
    // TODO: why do we need to duplicate the text here for this to detect properly?
    await expect(
      page.getByText('View Credit Bin View Credit Bin', {
        exact: true
      })
    ).toBeDisabled();
    await expect(page.getByText('Clear Course Selections')).toBeDisabled();
    await expect(page.getByText('Color Selector')).toBeDisabled();
    await expect(page.getByText('Delete Selected Courses')).toBeDisabled();
    await expect(page.getByText('Colorize Selected Courses')).toBeDisabled();
    await expect(page.getByText('Edit Selected Courses')).toBeDisabled();
    await expect(page.getByText('Duplicate Flow')).toBeDisabled();
    await expect(page.getByText('Export Flow as PDF')).toBeDisabled();
  });

  test('dropdown state correct when flowchart selected', async ({ page }) => {
    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // check that we can access the dropdown
    await expect(
      page.getByRole('button', {
        name: 'Actions'
      })
    ).toBeEnabled();
    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();

    // check that the appropriate dropdown items are enabled
    await expect(
      page.getByText('Add Terms', {
        exact: true
      })
    ).toBeEnabled();
    await expect(
      page.getByText('Remove Terms', {
        exact: true
      })
    ).toBeEnabled();
    await expect(page.getByText('Edit Flow Properties')).toBeEnabled();
    // TODO: why do we need to duplicate the text here for this to detect properly?
    await expect(
      page.getByText('View Credit Bin View Credit Bin', {
        exact: true
      })
    ).toBeEnabled();
    await expect(
      page.getByText('0 courses selected', {
        exact: true
      })
    ).toBeVisible();
    await expect(page.getByText('Clear Course Selections')).toBeDisabled();
    await expect(page.getByText('Color Selector')).toBeDisabled();
    await expect(page.getByText('Delete Selected Courses')).toBeDisabled();
    await expect(page.getByText('Colorize Selected Courses')).toBeDisabled();
    await expect(page.getByText('Edit Selected Courses')).toBeDisabled();
    await expect(page.getByText('Duplicate Flow')).toBeEnabled();
    await expect(page.getByText('Export Flow as PDF')).toBeEnabled();
  });

  test('dropdown state correct when courses are selected', async ({ page }) => {
    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // verify 0 courses are selected
    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    await expect(
      page.getByText('0 courses selected', {
        exact: true
      })
    ).toBeVisible();
    await expect(page.getByText('Clear Course Selections')).toBeDisabled();
    await expect(page.getByText('Color Selector')).toBeDisabled();
    await expect(page.getByText('Delete Selected Courses')).toBeDisabled();
    await expect(page.getByText('Colorize Selected Courses')).toBeDisabled();
    await expect(page.getByText('Edit Selected Courses')).toBeDisabled();

    // now select courses
    await getTermContainerCourseLocator(page, [0, 0]).click();
    await getTermContainerCourseLocator(page, [1, 0]).click();

    // verify 2 courses are selected
    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    await expect(
      page.getByText('2 courses selected', {
        exact: true
      })
    ).toBeVisible();
    await expect(page.getByText('Clear Course Selections')).toBeEnabled();
    await expect(page.getByText('Color Selector')).toBeEnabled();
    await expect(page.getByText('Delete Selected Courses')).toBeEnabled();
    await expect(page.getByText('Colorize Selected Courses')).toBeEnabled();
    await expect(page.getByText('Edit Selected Courses')).toBeEnabled();

    // deselect
    await getTermContainerCourseLocator(page, [0, 0]).click();
    await getTermContainerCourseLocator(page, [1, 0]).click();

    // verify 0 courses are selected
    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    await expect(
      page.getByText('0 courses selected', {
        exact: true
      })
    ).toBeVisible();
    await expect(page.getByText('Clear Course Selections')).toBeDisabled();
    await expect(page.getByText('Color Selector')).toBeDisabled();
    await expect(page.getByText('Delete Selected Courses')).toBeDisabled();
    await expect(page.getByText('Colorize Selected Courses')).toBeDisabled();
    await expect(page.getByText('Edit Selected Courses')).toBeDisabled();
  });

  test('dropdown state for Add Terms correct when flowchart has max terms', async ({ page }) => {
    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(1).click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 1'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 1'
      })
    ).toBeInViewport();

    // verify we cannot add more terms
    await expect(
      page.getByText('Add Terms', {
        exact: true
      })
    ).toBeDisabled();

    // verify we can delete terms
    await expect(
      page.getByText('Remove Terms', {
        exact: true
      })
    ).toBeEnabled();
  });

  test('dropdown state for Remove Terms correct when flowchart has no terms', async ({ page }) => {
    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2).click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 2'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 2'
      })
    ).toBeInViewport();

    // verify we cannot delete terms
    await expect(
      page.getByText('Remove Terms', {
        exact: true
      })
    ).toBeDisabled();

    // verify we can add more terms
    await expect(
      page.getByText('Add Terms', {
        exact: true
      })
    ).toBeEnabled();
  });

  test('dropdown View Credit Bin works properly', async ({ page }) => {
    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // don't expect credit bin to be visible
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).first().getByText('Credit Bin', {
        exact: true
      })
    ).not.toBeVisible();

    // toggle viewing
    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    await page
      .getByText('View Credit Bin View Credit Bin', {
        exact: true
      })
      .click();
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).first().getByText('Credit Bin', {
        exact: true
      })
    ).toBeVisible();

    // hide again
    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    await page
      .getByText('View Credit Bin View Credit Bin', {
        exact: true
      })
      .click();
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).first().getByText('Credit Bin', {
        exact: true
      })
    ).not.toBeVisible();
  });

  test('dropdown Clear Course Selections works properly', async ({ page }) => {
    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // now select courses
    await getTermContainerCourseLocator(page, [0, 0]).click();
    await getTermContainerCourseLocator(page, [1, 0]).click();

    // verify 2 courses are selected
    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    await expect(
      page.getByText('2 courses selected', {
        exact: true
      })
    ).toBeVisible();

    // now clear
    await page
      .getByText('Clear Course Selections', {
        exact: true
      })
      .click();

    // verify 0 courses are selected
    await expect(
      page.getByText('0 courses selected', {
        exact: true
      })
    ).toBeVisible();
    await expect(
      page.getByText('Clear Course Selections', {
        exact: true
      })
    ).toBeDisabled();
  });

  test('dropdown Color Selector works properly', async ({ page }) => {
    // verify color selector not present
    await expect(page.locator('.pcr-app.visible')).not.toBeVisible();

    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // now select courses
    await getTermContainerCourseLocator(page, [0, 0]).click();
    await getTermContainerCourseLocator(page, [1, 0]).click();

    // verify we can open color selector
    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    await page.getByText('Color Selector').click();
    await expect(page.locator('.pcr-app.visible')).toBeVisible();
  });

  test('dropdown Colorize Selected Courses works properly', async ({ page }) => {
    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // verify original colors
    await expect(getTermContainerCourseLocator(page, [0, 0])).toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)'
    );
    await expect(getTermContainerCourseLocator(page, [0, 1])).toHaveCSS(
      'background-color',
      'rgb(254, 253, 154)'
    );

    // change color
    await getTermContainerCourseLocator(page, [0, 0]).click();
    await getTermContainerCourseLocator(page, [0, 1]).click();

    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    await page.getByText('Colorize Selected Courses').click();

    // verify new colors
    await expect(getTermContainerCourseLocator(page, [0, 0])).toHaveCSS(
      'background-color',
      'rgb(27, 115, 60)'
    );
    await expect(getTermContainerCourseLocator(page, [0, 1])).toHaveCSS(
      'background-color',
      'rgb(27, 115, 60)'
    );
  });

  test('dropdown Delete Selected Courses works properly', async ({ page }) => {
    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // verify count of courses
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(0).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(4);

    // delete courses from first term
    await getTermContainerCourseLocator(page, [0, 0]).click();
    await getTermContainerCourseLocator(page, [0, 1]).click();

    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    await page.getByText('Delete Selected Courses').click();

    // verify courses deleted
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(0).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(2);
  });

  test('dropdown Duplicate Flow works properly', async ({ page }) => {
    // verify existing flowcharts
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2'
    ]);

    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // duplicate
    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    await page.getByText('Duplicate Flow').click();

    // expect new flowchart item to appear
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'Copy of test flow 0'
    ]);

    // fetch flowcharts from backend and verify that everything was copied as expected
    const flowcharts = await getUserFlowcharts(userId);
    const { id: origId, name: origName, ...origRest } = flowcharts[0].flowchart;
    const { id: newId, name: newName, ...newRest } = flowcharts[3].flowchart;
    expect(origId).not.toEqual(newId);
    expect(origName).toBe('test flow 0');
    expect(newName).toBe('Copy of test flow 0');
    expect(newRest).toStrictEqual(origRest);
  });

  test('dropdown Export Flow as PDF works properly', async ({ page }) => {
    // select flowchart
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // verify we can download PDF
    await expect(page.getByText('Export Flow as PDF')).toBeEnabled();

    // download
    await page
      .getByRole('button', {
        name: 'Actions'
      })
      .click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Export Flow as PDF').click();

    // expect dropdown state to be correct during download
    await expect(page.getByText('Export Flow as PDF')).toBeDisabled();
    await downloadPromise;
    await expect(page.getByText('Export Flow as PDF')).toBeEnabled();
  });
});
