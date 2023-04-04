import { expect, test } from '@playwright/test';
import { createUser, deleteUser } from '$lib/server/db/user';
import { performLoginFrontend } from '../util/userTestUtil.js';

const CREATE_FLOW_ROUTINE_TESTS_EMAIL = 'pfb_test_createFlowRoutine_playwright@test.com';

test.describe('create flow routine tests', () => {
  test.beforeAll(async () => {
    // create account
    await createUser({
      email: CREATE_FLOW_ROUTINE_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(CREATE_FLOW_ROUTINE_TESTS_EMAIL);
  });

  test('user able to create new flowchart', async ({ page }) => {
    await performLoginFrontend(page, CREATE_FLOW_ROUTINE_TESTS_EMAIL, 'test');

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
    // need to start waiting for response before request expected to happen so that it doesn't timeout
    // (need to setup listener before the event fires)
    const responsePromise = page.waitForResponse(/\/api\/data\/generateFlowchart/);
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('button', { name: 'Create' })).toHaveClass(/loading/);
    const response = await responsePromise;

    // done, check response
    await expect(page.getByRole('button', { name: 'Create' })).not.toHaveClass(/loading/);
    expect(response.ok()).toBeTruthy();
    const resJson = await response.json();
    expect(resJson).toHaveProperty('generatedFlowchart');
    expect(resJson).toHaveProperty('message');
    expect(resJson).toHaveProperty('courseCache');

    // make sure modal was closed
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeEnabled();
    await expect(page.getByText('Create New Flowchart')).not.toBeVisible();
  });

  test('401 case handled properly', async ({ page }) => {
    // mock a 401 response
    await page.route(/\/api\/data\/generateFlowchart/, async (route) => {
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
      dialog.accept();
    });

    await performLoginFrontend(page, CREATE_FLOW_ROUTINE_TESTS_EMAIL, 'test');

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
    const responsePromise = page.waitForResponse(/\/api\/data\/generateFlowchart/);
    await page.getByRole('button', { name: 'Create' }).click();
    const response = await responsePromise;

    // done, check response
    await expect(page.getByRole('button', { name: 'Create' })).not.toHaveClass(/loading/);
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(401);
    const resJson = await response.json();
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
    await page.route(/\/api\/data\/generateFlowchart/, async (route) => {
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
      dialog.accept();
    });

    await performLoginFrontend(page, CREATE_FLOW_ROUTINE_TESTS_EMAIL, 'test');

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
    const responsePromise = page.waitForResponse(/\/api\/data\/generateFlowchart/);
    await page.getByRole('button', { name: 'Create' }).click();
    const response = await responsePromise;

    // done, check response
    await expect(page.getByRole('button', { name: 'Create' })).not.toHaveClass(/loading/);
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
    const resJson = await response.json();
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
    await page.route(/\/api\/data\/generateFlowchart/, async (route) => {
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
      dialog.accept();
    });

    await performLoginFrontend(page, CREATE_FLOW_ROUTINE_TESTS_EMAIL, 'test');

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
    const responsePromise = page.waitForResponse(/\/api\/data\/generateFlowchart/);
    await page.getByRole('button', { name: 'Create' }).click();
    const response = await responsePromise;

    // done, check response
    await expect(page.getByRole('button', { name: 'Create' })).not.toHaveClass(/loading/);
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(500);
    const resJson = await response.json();
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

// TODO: add tests for the following:
// 1. if new flowchart was added to bottom of flowlist
// 2. if new flowchart was selected and loaded into editor
// 3. if new flowchart exists in user data
// 4. reload and see if new flowchart exists in user data (persist)
