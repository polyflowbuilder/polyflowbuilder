import { PrismaClient } from '@prisma/client';
import { expect, test } from '@playwright/test';
import { skipWelcomeMessage } from '$test/util/frontendInteractionUtil';
import { populateFlowcharts } from '$test/util/userDataTestUtil';
import { createUser, deleteUser } from '$lib/server/db/user';
import { FLOW_LIST_ITEM_SELECTOR } from '$test/util/selectorTestUtil';
import { getUserEmailString, performLoginFrontend } from '$test/util/userTestUtil';

// TODO: is this a "routine", or an "Action"? figure out what routine is and
// reorganize the tests

test.describe('create flow routine tests', () => {
  const prisma = new PrismaClient();
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString('pfb_test_createFlowRoutine_playwright@test.com', testInfo);
    const id = await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('id null');
    }

    // create test flow to verify creation behavior in frontend
    await populateFlowcharts(prisma, id, 10);
  });

  test.beforeEach(async ({ page }) => {
    await skipWelcomeMessage(page);
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(userEmail);
  });

  test('user able to create new flowchart', async ({ page }) => {
    // add delay to query requests to ensure Playwright can capture loading spinner
    await page.route(/\/api\/util\/generateFlowchart/, async (route) => {
      await new Promise((r) => setTimeout(r, 250));
      void route.continue();
    });

    await performLoginFrontend(page, userEmail, 'test');

    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // make sure test flows exist
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

    // open the flow modal
    await page.getByRole('button', { name: 'New Flow' }).click();
    await expect(page.getByText('Create New Flowchart')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();

    // fill out modal
    await page.getByRole('textbox', { name: 'Flow Name' }).fill('pfb_test_createFlowRoutine');
    await page.getByRole('combobox', { name: 'Starting Year' }).selectOption('2020');
    await page.getByRole('combobox', { name: 'Catalog' }).selectOption('2019-2020');
    await page.getByRole('combobox', { name: 'Major' }).selectOption('Computer Engineering');
    await page
      .getByRole('combobox', { name: 'Concentration' })
      .selectOption('Not Applicable For This Major');
    await page.getByRole('checkbox', { name: 'Remove GE Courses' }).scrollIntoViewIfNeeded();
    await page.getByRole('checkbox', { name: 'Remove GE Courses' }).click({ force: true });
    await expect(page.getByRole('button', { name: 'Create' })).toBeEnabled();

    // create and wait for response from network
    // need to start waiting for response before request expected to happen so that it doesn't timeout
    // (need to setup listener before the event fires)
    const responsePromise = page.waitForResponse(/\/api\/util\/generateFlowchart/);
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('button', { name: 'Create' }).locator('span')).toHaveClass(
      /loading/
    );
    const response = await responsePromise;

    // done, check response
    expect(response.ok()).toBeTruthy();
    const resJson: unknown = await response.json();
    expect(resJson).toHaveProperty('generatedFlowchart');
    expect(resJson).toHaveProperty('message');
    expect(resJson).toHaveProperty('courseCache');

    // make sure modal was closed
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeEnabled();
    await expect(page.getByText('Create New Flowchart')).not.toBeVisible();

    // check if new flow appeared at bottom of flow list
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
      'test flow 9',
      'pfb_test_createFlowRoutine'
    ]);

    // check that flowchart was selected
    await expect(
      page.getByRole('heading', {
        name: 'pfb_test_createFlowRoutine'
      })
    ).toBeInViewport();

    // check that flow list item for new flowchart was scrolled into view
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR).last()).toBeInViewport();

    // check that the course cache was updated properly
    await expect(
      page.getByText('Introduction to Computing', {
        exact: true
      })
    ).toBeInViewport();

    // reload the page and expect new flow to persist
    await page.reload();
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
      'test flow 9',
      'pfb_test_createFlowRoutine'
    ]);

    // select the flowchart again
    await page.locator(FLOW_LIST_ITEM_SELECTOR).last().click();

    // verify that the course cache is loaded properly
    await expect(
      page.getByText('Introduction to Computing', {
        exact: true
      })
    ).toBeInViewport();
  });

  test('401 case handled properly', async ({ page }) => {
    // mock a 401 response
    await page.route(/\/api\/util\/generateFlowchart/, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Generate flowchart request must be authenticated.'
        })
      });
    });

    let alertPopup = false;
    page.on('dialog', (dialog) => {
      alertPopup = true;
      expect(dialog.message()).toBe(
        'The request to create a new flowchart was unauthenticated. Please refresh the page and try again.'
      );
      dialog.accept().catch(() => {
        throw new Error('accepting dialog failed');
      });
    });

    await performLoginFrontend(page, userEmail, 'test');

    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // open the flow modal
    await page.getByRole('button', { name: 'New Flow' }).click();
    await expect(page.getByText('Create New Flowchart')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();

    // fill out modal
    await page.getByRole('textbox', { name: 'Flow Name' }).fill('test');
    await page.getByRole('combobox', { name: 'Starting Year' }).selectOption('2020');
    await page.getByRole('combobox', { name: 'Catalog' }).selectOption('2019-2020');
    await page.getByRole('combobox', { name: 'Major' }).selectOption('Computer Engineering');
    await page
      .getByRole('combobox', { name: 'Concentration' })
      .selectOption('Not Applicable For This Major');
    await page.getByRole('checkbox', { name: 'Remove GE Courses' }).scrollIntoViewIfNeeded();
    await page.getByRole('checkbox', { name: 'Remove GE Courses' }).click({ force: true });
    await expect(page.getByRole('button', { name: 'Create' })).toBeEnabled();

    // create and wait for response from network
    // dont check for loading class bc goes away when dialog is handled (eg immediately)
    const responsePromise = page.waitForResponse(/\/api\/util\/generateFlowchart/);
    await page.getByRole('button', { name: 'Create' }).click();
    const response = await responsePromise;

    // done, check response
    await expect(page.getByRole('button', { name: 'Create' }).locator('span')).not.toHaveClass(
      /loading/
    );
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
    const resJson: unknown = await response.json();
    expect(resJson).toStrictEqual({
      message: 'Generate flowchart request must be authenticated.'
    });

    // make sure popup comes up telling us that it's unauthenticated
    expect(alertPopup).toBeTruthy();

    // make sure modal was not closed
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeEnabled();
    await expect(page.getByText('Create New Flowchart')).toBeVisible();
  });

  test('400 case handled properly', async ({ page }) => {
    // mock a 400 response
    await page.route(/\/api\/util\/generateFlowchart/, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Invalid input received.'
        })
      });
    });

    let alertPopup = false;
    page.on('dialog', (dialog) => {
      alertPopup = true;
      expect(dialog.message()).toBe(
        'An error occurred while trying to create a new flowchart. Please refresh the page, and submit a bug report if this error persists.'
      );
      dialog.accept().catch(() => {
        throw new Error('accepting dialog failed');
      });
    });

    await performLoginFrontend(page, userEmail, 'test');

    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // open the flow modal
    await page.getByRole('button', { name: 'New Flow' }).click();
    await expect(page.getByText('Create New Flowchart')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();

    // fill out modal
    await page.getByRole('textbox', { name: 'Flow Name' }).fill('test');
    await page.getByRole('combobox', { name: 'Starting Year' }).selectOption('2020');
    await page.getByRole('combobox', { name: 'Catalog' }).selectOption('2019-2020');
    await page.getByRole('combobox', { name: 'Major' }).selectOption('Computer Engineering');
    await page
      .getByRole('combobox', { name: 'Concentration' })
      .selectOption('Not Applicable For This Major');
    await page.getByRole('checkbox', { name: 'Remove GE Courses' }).scrollIntoViewIfNeeded();
    await page.getByRole('checkbox', { name: 'Remove GE Courses' }).click({ force: true });
    await expect(page.getByRole('button', { name: 'Create' })).toBeEnabled();

    // create and wait for response from network
    // dont check for loading class bc goes away when dialog is handled (eg immediately)
    const responsePromise = page.waitForResponse(/\/api\/util\/generateFlowchart/);
    await page.getByRole('button', { name: 'Create' }).click();
    const response = await responsePromise;

    // done, check response
    await expect(page.getByRole('button', { name: 'Create' }).locator('span')).not.toHaveClass(
      /loading/
    );
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
    const resJson: unknown = await response.json();
    expect(resJson).toStrictEqual({
      message: 'Invalid input received.'
    });

    // make sure popup comes up telling us that it's unauthenticated
    expect(alertPopup).toBeTruthy();

    // make sure modal was not closed
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeEnabled();
    await expect(page.getByText('Create New Flowchart')).toBeVisible();
  });

  test('500 case handled properly', async ({ page }) => {
    // mock a 500 response
    await page.route(/\/api\/util\/generateFlowchart/, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'An error occurred while generating new flowchart, please try again a bit later.'
        })
      });
    });

    let alertPopup = false;
    page.on('dialog', (dialog) => {
      alertPopup = true;
      expect(dialog.message()).toBe(
        'An error occurred while trying to create a new flowchart. Please refresh the page, and submit a bug report if this error persists.'
      );
      dialog.accept().catch(() => {
        throw new Error('accepting dialog failed');
      });
    });

    await performLoginFrontend(page, userEmail, 'test');

    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // open the flow modal
    await page.getByRole('button', { name: 'New Flow' }).click();
    await expect(page.getByText('Create New Flowchart')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();

    // fill out modal
    await page.getByRole('textbox', { name: 'Flow Name' }).fill('test');
    await page.getByRole('combobox', { name: 'Starting Year' }).selectOption('2020');
    await page.getByRole('combobox', { name: 'Catalog' }).selectOption('2019-2020');
    await page.getByRole('combobox', { name: 'Major' }).selectOption('Computer Engineering');
    await page
      .getByRole('combobox', { name: 'Concentration' })
      .selectOption('Not Applicable For This Major');
    await page.getByRole('checkbox', { name: 'Remove GE Courses' }).scrollIntoViewIfNeeded();
    await page.getByRole('checkbox', { name: 'Remove GE Courses' }).click({ force: true });
    await expect(page.getByRole('button', { name: 'Create' })).toBeEnabled();

    // create and wait for response from network
    // dont check for loading class bc goes away when dialog is handled (eg immediately)
    const responsePromise = page.waitForResponse(/\/api\/util\/generateFlowchart/);
    await page.getByRole('button', { name: 'Create' }).click();
    const response = await responsePromise;

    // done, check response
    await expect(page.getByRole('button', { name: 'Create' }).locator('span')).not.toHaveClass(
      /loading/
    );
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(500);
    const resJson: unknown = await response.json();
    expect(resJson).toStrictEqual({
      message: 'An error occurred while generating new flowchart, please try again a bit later.'
    });

    // make sure popup comes up telling us that it's unauthenticated
    expect(alertPopup).toBeTruthy();

    // make sure modal was not closed
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeEnabled();
    await expect(page.getByText('Create New Flowchart')).toBeVisible();
  });
});
