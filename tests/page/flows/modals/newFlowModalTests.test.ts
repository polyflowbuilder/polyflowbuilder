import { expect, test } from '@playwright/test';
import { performLoginFrontend } from '../../../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import type { Page } from '@playwright/test';

const FLOWS_PAGE_NEW_FLOW_MODAL_TESTS_EMAIL =
  'pfb_test_flowsPage_new_flow_modal_playwright@test.com';

async function openModalAndVerifyCorrectState(page: Page) {
  await page.getByRole('button', { name: 'New Flow' }).click();
  await expect(page.getByText('Create New Flowchart')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
}

async function closeModalAndVerifyCorrectState(page: Page) {
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Create New Flowchart')).not.toBeVisible();
}

test.describe('new flow modal tests', () => {
  test.beforeAll(async () => {
    // create account
    await createUser({
      email: FLOWS_PAGE_NEW_FLOW_MODAL_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });
  });

  test.beforeEach(async ({ page }) => {
    await performLoginFrontend(page, FLOWS_PAGE_NEW_FLOW_MODAL_TESTS_EMAIL, 'test');
  });

  test.afterAll(async () => {
    await deleteUser(FLOWS_PAGE_NEW_FLOW_MODAL_TESTS_EMAIL);
  });

  test('modal default state correct', async ({ page }) => {
    // make sure we can open modal and that its currently closed
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Flow' })).toBeEnabled();
    await expect(page.getByText('Create New Flowchart')).not.toBeVisible();
  });

  test('modal state correct after open', async ({ page }) => {
    // open model and verify its there
    await openModalAndVerifyCorrectState(page);
  });

  test('modal accepts valid input', async ({ page }) => {
    // create valid inputs
    await page.getByRole('button', { name: 'New Flow' }).click();
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
  });

  test('modal state correct after close', async ({ page }) => {
    // open
    await openModalAndVerifyCorrectState(page);

    // close modal and verify its gone
    await closeModalAndVerifyCorrectState(page);
  });

  test('modal re-open state correct', async ({ page }) => {
    // open
    await openModalAndVerifyCorrectState(page);

    // close
    await closeModalAndVerifyCorrectState(page);

    // re-open, see that all inputs are empty
    await openModalAndVerifyCorrectState(page);

    await expect(page.getByRole('textbox', { name: 'Flow Name' })).toHaveValue('');
    await expect(page.getByRole('combobox', { name: 'Starting Year' })).toHaveValue('');
    await expect(page.getByRole('combobox', { name: 'Catalog' })).toHaveValue('');
    await expect(page.getByRole('combobox', { name: 'Major' })).toHaveValue('');
    await expect(page.getByRole('combobox', { name: 'Concentration' })).toHaveValue('');
    await expect(page.getByRole('checkbox', { name: 'Remove GE Courses' })).not.toBeChecked();
    await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();

    // close modal and verify its gone
    await closeModalAndVerifyCorrectState(page);
  });
});