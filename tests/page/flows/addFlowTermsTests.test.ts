import { expect, test, type Page } from '@playwright/test';
import { performLoginFrontend } from '../../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { populateFlowcharts } from 'tests/util/userDataTestUtil.js';
import { PrismaClient } from '@prisma/client';
import {
  FLOW_LIST_ITEM_SELECTOR,
  TERM_CONTAINER_COURSES_SELECTOR,
  TERM_CONTAINER_SELECTOR
} from 'tests/util/selectorTestUtil.js';

const FLOWS_PAGE_ADD_TERMS_MODAL_TESTS_EMAIL =
  'pfb_test_flowsPage_add_terms_modal_playwright@test.com';

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
    // verify model updated appropriately
    await expect(page.locator('select[name=addTerms] > option')).toHaveText(
      originalTermsToAdd.filter((term) => !newTermsToAdd.includes(term))
    );
    await expect(
      page.getByRole('listbox', {
        name: 'select flowchart terms to add',
        includeHidden: true
      })
    ).toHaveValues([]);

    // verify data update was successful
    const resJson = (await response.json()) as Record<string, unknown>;
    expect(response.status()).toStrictEqual(200);
    expect(resJson.message).toStrictEqual('User flowchart data changes successfully persisted.');

    // verify UI was updated successfully
    await expect(page.locator(TERM_CONTAINER_SELECTOR)).toHaveCount(
      originalFlowchartTerms.length + newTermsToAdd.length
    );
    await expect(page.locator('.termContainerHeader h3')).toHaveText([
      ...originalFlowchartTerms,
      ...newTermsToAdd
    ]);

    for (
      let i = originalFlowchartTerms.length;
      i < originalFlowchartTerms.length + newTermsToAdd.length;
      i += 1
    ) {
      await expect(
        page.locator(TERM_CONTAINER_SELECTOR).nth(i).locator(TERM_CONTAINER_COURSES_SELECTOR)
      ).toHaveCount(0);
      await expect(page.locator('.termContainerFooter h3').nth(i)).toHaveText('0');
    }

    // reload page and expect changes to persist
    await page.reload();
    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(flowchartIdx).click();

    await expect(page.locator(TERM_CONTAINER_SELECTOR)).toHaveCount(
      originalFlowchartTerms.length + newTermsToAdd.length
    );
    await expect(page.locator('.termContainerHeader h3')).toHaveText([
      ...originalFlowchartTerms,
      ...newTermsToAdd
    ]);

    for (
      let i = originalFlowchartTerms.length;
      i < originalFlowchartTerms.length + newTermsToAdd.length;
      i += 1
    ) {
      await expect(
        page.locator(TERM_CONTAINER_SELECTOR).nth(i).locator(TERM_CONTAINER_COURSES_SELECTOR)
      ).toHaveCount(0);
      await expect(page.locator('.termContainerFooter h3').nth(i)).toHaveText('0');
    }
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
  test.describe.configure({ mode: 'serial' });
  const prisma = new PrismaClient();
  let userId: string;

  test.beforeAll(async () => {
    // create account
    const id = await createUser({
      email: FLOWS_PAGE_ADD_TERMS_MODAL_TESTS_EMAIL,
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
    await performLoginFrontend(page, FLOWS_PAGE_ADD_TERMS_MODAL_TESTS_EMAIL, 'test');
  });

  test.afterAll(async () => {
    await deleteUser(FLOWS_PAGE_ADD_TERMS_MODAL_TESTS_EMAIL);
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

  test('user able to add one new flowchart term', async ({ page }) => {
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