import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { populateFlowcharts } from '$test/util/userDataTestUtil';
import { incrementRangedUnits } from '$lib/common/util/unitCounterUtilCommon';
import { createUser, deleteUser } from '$lib/server/db/user';
import { dragAndDrop, skipWelcomeMessage } from '$test/util/frontendInteractionUtil';
import { getUserEmailString, performLoginFrontend } from '$test/util/userTestUtil';
import {
  FLOW_LIST_ITEM_SELECTOR,
  TERM_CONTAINER_SELECTOR,
  getTermContainerCourseLocator,
  TERM_CONTAINER_COURSES_SELECTOR
} from '$test/util/selectorTestUtil';
import type { Page } from '@playwright/test';

async function verifyUIChangesAfterAddTerms(
  page: Page,
  originalFlowchartTerms: string[],
  originalTermsToAdd: string[],
  newTermsToAdd: string[]
) {
  // verify modal updated appropriately
  await expect(page.locator('select[name=addTerms] > option')).toHaveText(
    originalTermsToAdd.filter((term) => !newTermsToAdd.includes(term))
  );
  await expect(
    page.getByRole('listbox', {
      name: 'select flowchart terms to add',
      includeHidden: true
    })
  ).toHaveValues([]);

  // verify UI was updated successfully
  await expect(page.locator(TERM_CONTAINER_SELECTOR)).toHaveCount(
    originalFlowchartTerms.length + newTermsToAdd.length
  );
  await expect(page.locator('.termContainerHeader h3')).toHaveText([
    ...originalFlowchartTerms,
    ...newTermsToAdd
  ]);

  // verify the new terms have a zeroed out unit count
  const termContainerTermNames = await page.locator('.termContainerHeader h3').allInnerTexts();
  const termContainerUnitCounts = await page.locator('.termContainerFooter h3').allInnerTexts();
  termContainerTermNames.forEach((termContainerTermName, i) => {
    if (newTermsToAdd.includes(termContainerTermName)) {
      expect(termContainerUnitCounts[i]).toBe('0');
    } else {
      expect(termContainerUnitCounts[i]).not.toBe('0');
    }
  });

  // verify total flowchart units from termContainer matches total flowchart units from footer
  const totalUnitCountFromTerms = termContainerUnitCounts
    .map((termFooterText) => termFooterText.split(' ')[0])
    .reduce((acc, curVal) => incrementRangedUnits(acc, curVal), '0');
  const totalUnitCountFromFooter = (await page.locator('#flowEditorFooterTotal').innerText())
    .split(' ')
    .at(-1);
  expect(totalUnitCountFromFooter).toBe(totalUnitCountFromTerms);
}

async function performAddTermsTest(
  page: Page,
  flowchartIdx: number,
  originalFlowchartTerms: string[],
  originalTermsToAdd: string[],
  newTermsToAdd: string[],
  verifySuccess = true
) {
  // load a flowchart
  await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(flowchartIdx).click();

  // open modal
  await expect(
    page.getByText('Actions', {
      exact: true
    })
  ).toBeEnabled();
  await page
    .getByText('Actions', {
      exact: true
    })
    .click();
  await page
    .getByText('Add Terms', {
      exact: true
    })
    .click();

  // verify default state
  await expect(page.getByText('Add Flowchart Terms')).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Add Terms to Flowchart'
    })
  ).toBeDisabled();
  await expect(
    page.getByRole('listbox', {
      name: 'select flowchart terms to add'
    })
  ).toHaveValues([]);
  await expect(page.locator('select[name=addTerms] > option')).toHaveText(originalTermsToAdd);

  // add flowchart term
  await page
    .getByRole('listbox', {
      name: 'select flowchart terms to add'
    })
    .selectOption(newTermsToAdd);
  await expect(
    page.getByRole('button', {
      name: 'Add Terms to Flowchart'
    })
  ).toBeEnabled();

  // perform add - wait for response from network
  // need to start waiting for response before request expected to happen so that it doesn't timeout
  // (need to setup listener before the event fires)
  const responsePromise = page.waitForResponse(/\/api\/user\/data\/updateUserFlowcharts/);
  await page
    .getByRole('button', {
      name: 'Add Terms to Flowchart'
    })
    .click();
  const response = await responsePromise;

  // done, make sure modal was closed
  await expect(page.getByText('Add Flowchart Terms')).not.toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Add Terms to Flowchart',
      includeHidden: true
    })
  ).toBeDisabled();

  if (verifySuccess) {
    // verify data update was successful
    const resJson = (await response.json()) as Record<string, unknown>;
    expect(response.status()).toStrictEqual(200);
    expect(resJson.message).toStrictEqual('User flowchart data changes successfully persisted.');

    await verifyUIChangesAfterAddTerms(
      page,
      originalFlowchartTerms,
      originalTermsToAdd,
      newTermsToAdd
    );

    // reload page and expect changes to persist
    await page.reload();
    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(flowchartIdx).click();

    await verifyUIChangesAfterAddTerms(
      page,
      originalFlowchartTerms,
      originalTermsToAdd,
      newTermsToAdd
    );
  }
}

async function verifyAddTermFailure(
  page: Page,
  flowchartIdx: number,
  originalFlowchartTerms: string[],
  originalTermsToAdd: string[],
  newTermsToAdd: string[],
  responseCode: number,
  responseMessage: string,
  dialogMessage: string
) {
  // mock a response
  await page.route(/\/api\/user\/data\/updateUserFlowcharts/, async (route) => {
    await route.fulfill({
      status: responseCode,
      contentType: 'application/json',
      body: JSON.stringify({
        message: responseMessage
      })
    });
  });

  let alertPopup = false;
  page.on('dialog', (dialog) => {
    alertPopup = true;
    expect(dialog.message()).toBe(dialogMessage);
    dialog.accept().catch(() => {
      throw new Error('accepting dialog failed');
    });
  });

  // add a term
  await performAddTermsTest(
    page,
    flowchartIdx,
    originalFlowchartTerms,
    originalTermsToAdd,
    newTermsToAdd,
    false
  );

  // make sure popup comes up
  expect(alertPopup).toBeTruthy();

  // make sure original state is preserved
  await expect(
    page.getByRole('listbox', {
      name: 'select flowchart terms to add',
      includeHidden: true
    })
  ).toHaveValues([]);
  await expect(page.locator('select[name=addTerms] > option')).toHaveText(originalTermsToAdd);
  await expect(page.locator(TERM_CONTAINER_SELECTOR)).toHaveCount(originalFlowchartTerms.length);
}

test.describe('add flowchart terms tests', () => {
  const prisma = new PrismaClient();
  let userId: string;
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_flowsPage_add_terms_modal_playwright@test.com',
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

  test('add flowchart terms default state correct', async ({ page }) => {
    // make sure we can open modal when a flowchart is selected and that it's currently closed

    // cannot access when no flowchart is selected
    await expect(page.getByText('Add Flowchart Terms')).not.toBeVisible();
    await expect(
      page.getByText('Actions', {
        exact: true
      })
    ).not.toBeEnabled();
  });

  // do error cases before success cases so that we don't see the newly added terms
  test('400 case handled properly', async ({ page }) => {
    await verifyAddTermFailure(
      page,
      0,
      ['Summer 2020', 'Fall 2020', 'Winter 2021', 'Spring 2021', 'Summer 2021', 'Fall 2021'],
      [
        'Winter 2022',
        'Spring 2022',
        'Summer 2022',
        'Fall 2022',
        'Winter 2023',
        'Spring 2023',
        'Summer 2023',
        'Fall 2023',
        'Winter 2024',
        'Spring 2024',
        'Summer 2024',
        'Fall 2024',
        'Winter 2025',
        'Spring 2025',
        'Summer 2025',
        'Fall 2025',
        'Winter 2026',
        'Spring 2026',
        'Summer 2026',
        'Fall 2026',
        'Winter 2027',
        'Spring 2027'
      ],
      ['Fall 2023'],
      400,
      'Invalid input received.',
      'ERROR: The server reported an error on data modification. This means that your most recent changes were not saved. Please reload the page to ensure that no data has been lost.'
    );
  });

  test('401 case handled properly', async ({ page }) => {
    await verifyAddTermFailure(
      page,
      0,
      ['Summer 2020', 'Fall 2020', 'Winter 2021', 'Spring 2021', 'Summer 2021', 'Fall 2021'],
      [
        'Winter 2022',
        'Spring 2022',
        'Summer 2022',
        'Fall 2022',
        'Winter 2023',
        'Spring 2023',
        'Summer 2023',
        'Fall 2023',
        'Winter 2024',
        'Spring 2024',
        'Summer 2024',
        'Fall 2024',
        'Winter 2025',
        'Spring 2025',
        'Summer 2025',
        'Fall 2025',
        'Winter 2026',
        'Spring 2026',
        'Summer 2026',
        'Fall 2026',
        'Winter 2027',
        'Spring 2027'
      ],
      ['Fall 2023'],
      401,
      'Request was unauthenticated. Please authenticate and try again.',
      'ERROR: You were not authorized to perform the most recent flow data change. Please refresh the page and re-authenticate.'
    );
  });

  test('500 case handled properly', async ({ page }) => {
    await verifyAddTermFailure(
      page,
      0,
      ['Summer 2020', 'Fall 2020', 'Winter 2021', 'Spring 2021', 'Summer 2021', 'Fall 2021'],
      [
        'Winter 2022',
        'Spring 2022',
        'Summer 2022',
        'Fall 2022',
        'Winter 2023',
        'Spring 2023',
        'Summer 2023',
        'Fall 2023',
        'Winter 2024',
        'Spring 2024',
        'Summer 2024',
        'Fall 2024',
        'Winter 2025',
        'Spring 2025',
        'Summer 2025',
        'Fall 2025',
        'Winter 2026',
        'Spring 2026',
        'Summer 2026',
        'Fall 2026',
        'Winter 2027',
        'Spring 2027'
      ],
      ['Fall 2023'],
      500,
      'An error occurred while updating user flowcharts, please try again a bit later.',
      'ERROR: The server reported an error on data modification. This means that your most recent changes were not saved. Please reload the page to ensure that no data has been lost.'
    );
  });

  test('user able to add one new flowchart term', async ({ page }, testInfo) => {
    await performAddTermsTest(
      page,
      0,
      ['Summer 2020', 'Fall 2020', 'Winter 2021', 'Spring 2021', 'Summer 2021', 'Fall 2021'],
      [
        'Winter 2022',
        'Spring 2022',
        'Summer 2022',
        'Fall 2022',
        'Winter 2023',
        'Spring 2023',
        'Summer 2023',
        'Fall 2023',
        'Winter 2024',
        'Spring 2024',
        'Summer 2024',
        'Fall 2024',
        'Winter 2025',
        'Spring 2025',
        'Summer 2025',
        'Fall 2025',
        'Winter 2026',
        'Spring 2026',
        'Summer 2026',
        'Fall 2026',
        'Winter 2027',
        'Spring 2027'
      ],
      ['Fall 2023']
    );

    // make sure we can move courses into the new term
    await dragAndDrop({
      page,
      testInfo,
      locatorToDrag: getTermContainerCourseLocator(page, [5, 0]),
      locatorDragTarget: page.locator(TERM_CONTAINER_SELECTOR).nth(6)
    });

    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(6).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(1);
    await expect(getTermContainerCourseLocator(page, [6, 0]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
  });

  test('user able to add multiple flowchart terms', async ({ page }) => {
    await performAddTermsTest(
      page,
      1,
      [
        'Summer 2020',
        'Fall 2020',
        'Winter 2021',
        'Spring 2021',
        'Summer 2021',
        'Fall 2021',
        'Winter 2022',
        'Spring 2022',
        'Summer 2022',
        'Fall 2022'
      ],
      [
        'Winter 2023',
        'Spring 2023',
        'Summer 2023',
        'Fall 2023',
        'Winter 2024',
        'Spring 2024',
        'Summer 2024',
        'Fall 2024',
        'Winter 2025',
        'Spring 2025',
        'Summer 2025',
        'Fall 2025',
        'Winter 2026',
        'Spring 2026',
        'Summer 2026',
        'Fall 2026',
        'Winter 2027',
        'Spring 2027'
      ],
      ['Winter 2023', 'Summer 2024', 'Spring 2026', 'Spring 2027']
    );
  });
});
