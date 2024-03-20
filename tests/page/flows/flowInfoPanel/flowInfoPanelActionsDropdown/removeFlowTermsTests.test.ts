import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { skipWelcomeMessage } from 'tests/util/frontendInteractionUtil';
import { populateFlowcharts } from 'tests/util/userDataTestUtil';
import { incrementRangedUnits } from '$lib/common/util/unitCounterUtilCommon';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginFrontend } from 'tests/util/userTestUtil';
import { FLOW_LIST_ITEM_SELECTOR, TERM_CONTAINER_SELECTOR } from 'tests/util/selectorTestUtil';
import type { Page } from '@playwright/test';

async function verifyUIChangesAfterRemoveTerms(
  page: Page,
  originalFlowchartTerms: string[],
  termsToRemove: string[]
) {
  // verify that modal state is correct
  await expect(page.locator('select[name=deleteTerms] > option')).toHaveText(
    originalFlowchartTerms.filter((term) => !termsToRemove.includes(term))
  );
  await expect(
    page.getByRole('listbox', {
      name: 'select flowchart terms to delete',
      includeHidden: true
    })
  ).toHaveValues([]);

  // verify termContainers were updated properly
  await expect(page.locator(TERM_CONTAINER_SELECTOR)).toHaveCount(
    originalFlowchartTerms.length - termsToRemove.length
  );
  await expect(page.locator('.termContainerHeader h3')).toHaveText(
    originalFlowchartTerms.filter((term) => !termsToRemove.includes(term))
  );

  // verify total flowchart units from termContainers matches total flowchart units from footer
  const totalUnitCountFromTerms = (await page.locator('.termContainerFooter h3').allInnerTexts())
    .map((termFooterText) => termFooterText.split(' ')[0])
    .reduce((acc, curVal) => incrementRangedUnits(acc, curVal), '0');
  const totalUnitCountFromFooter = (await page.locator('#flowEditorFooterTotal').innerText())
    .split(' ')
    .at(-1);
  expect(totalUnitCountFromFooter).toBe(totalUnitCountFromTerms);
}

async function performRemoveTermsTest(
  page: Page,
  flowchartIdx: number,
  originalFlowchartTerms: string[],
  termsToRemove: string[],
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
    .getByText('Remove Terms', {
      exact: true
    })
    .click();

  // verify default state when open
  await expect(page.getByText('Remove Flowchart Terms')).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Remove Terms from Flowchart'
    })
  ).toBeDisabled();
  await expect(
    page.getByRole('listbox', {
      name: 'select flowchart terms to delete'
    })
  ).toHaveValues([]);
  await expect(page.locator('select[name=deleteTerms] > option')).toHaveText(
    originalFlowchartTerms
  );

  // remove flowchart terms
  await page
    .getByRole('listbox', {
      name: 'select flowchart terms to delete'
    })
    .selectOption(termsToRemove);
  await expect(
    page.getByRole('button', {
      name: 'Remove Terms from Flowchart'
    })
  ).toBeEnabled();

  // perform remove - wait for response from network
  // need to start waiting for response before request expected to happen so that it doesn't timeout
  // (need to setup listener before the event fires)
  const responsePromise = page.waitForResponse(/\/api\/user\/data\/updateUserFlowcharts/);
  await page
    .getByRole('button', {
      name: 'Remove Terms from Flowchart'
    })
    .click();
  const response = await responsePromise;

  // done, make sure modal was closed
  await expect(page.getByText('Remove Flowchart Terms')).not.toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Remove Terms from Flowchart',
      includeHidden: true
    })
  ).toBeDisabled();

  if (verifySuccess) {
    // verify data update was successful
    const resJson = (await response.json()) as Record<string, unknown>;
    expect(response.status()).toStrictEqual(200);
    expect(resJson.message).toStrictEqual('User flowchart data changes successfully persisted.');

    await verifyUIChangesAfterRemoveTerms(page, originalFlowchartTerms, termsToRemove);

    // reload page and expect changes to persist
    await page.reload();
    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(flowchartIdx).click();

    await verifyUIChangesAfterRemoveTerms(page, originalFlowchartTerms, termsToRemove);
  }
}

async function verifyRemoveTermFailure(
  page: Page,
  flowchartIdx: number,
  originalFlowchartTerms: string[],
  termsToRemove: string[],
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

  // remove term(s)
  await performRemoveTermsTest(page, flowchartIdx, originalFlowchartTerms, termsToRemove, false);

  // make sure popup comes up
  expect(alertPopup).toBeTruthy();

  // make sure original state is preserved
  await expect(
    page.getByRole('listbox', {
      name: 'select flowchart terms to add',
      includeHidden: true
    })
  ).toHaveValues([]);
  await expect(page.locator('select[name=deleteTerms] > option')).toHaveText(
    originalFlowchartTerms
  );
  await expect(page.locator(TERM_CONTAINER_SELECTOR)).toHaveCount(originalFlowchartTerms.length);
}

test.describe('remove flowchart terms tests', () => {
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
    await populateFlowcharts(prisma, userId, 3, [
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
      },
      {
        idx: 2,
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

  test('400 case handled properly', async ({ page }) => {
    await verifyRemoveTermFailure(
      page,
      0,
      ['Summer 2020', 'Fall 2020', 'Winter 2021', 'Spring 2021', 'Summer 2021', 'Fall 2021'],
      ['Summer 2020'],
      400,
      'Invalid input received.',
      'ERROR: The server reported an error on data modification. This means that your most recent changes were not saved. Please reload the page to ensure that no data has been lost.'
    );
  });

  test('401 case handled properly', async ({ page }) => {
    await verifyRemoveTermFailure(
      page,
      0,
      ['Summer 2020', 'Fall 2020', 'Winter 2021', 'Spring 2021', 'Summer 2021', 'Fall 2021'],
      ['Summer 2020'],
      401,
      'Request was unauthenticated. Please authenticate and try again.',
      'ERROR: You were not authorized to perform the most recent flow data change. Please refresh the page and re-authenticate.'
    );
  });

  test('500 case handled properly', async ({ page }) => {
    await verifyRemoveTermFailure(
      page,
      0,
      ['Summer 2020', 'Fall 2020', 'Winter 2021', 'Spring 2021', 'Summer 2021', 'Fall 2021'],
      ['Summer 2020'],
      500,
      'An error occurred while updating user flowcharts, please try again a bit later.',
      'ERROR: The server reported an error on data modification. This means that your most recent changes were not saved. Please reload the page to ensure that no data has been lost.'
    );
  });

  test('user able to delete one flowchart term', async ({ page }) => {
    await performRemoveTermsTest(
      page,
      0,
      ['Summer 2020', 'Fall 2020', 'Winter 2021', 'Spring 2021', 'Summer 2021', 'Fall 2021'],
      ['Summer 2020']
    );
  });

  test('user able to delete multiple consecutive flowchart terms', async ({ page }) => {
    await performRemoveTermsTest(
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
      ['Summer 2020', 'Fall 2020', 'Winter 2021']
    );
  });

  test('user able to delete multiple non-consecutive flowchart terms', async ({ page }) => {
    await performRemoveTermsTest(
      page,
      2,
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
      ['Spring 2021', 'Spring 2022', 'Fall 2022']
    );
  });
});
