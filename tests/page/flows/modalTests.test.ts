import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export async function testNewFlowModal(page: Page) {
  // make sure we can open modal and that its currently closed
  await expect(page.getByRole('button', { name: 'New Flow' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'New Flow' })).toBeEnabled();
  await expect(page.getByText('Create New Flowchart')).not.toBeVisible();

  // open model and verify its there
  await page.getByRole('button', { name: 'New Flow' }).click();
  await expect(page.getByText('Create New Flowchart')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();

  // create valid inputs
  await page.getByRole('textbox', { name: 'Flow Name' }).fill('test');
  await page.getByRole('combobox', { name: 'Starting Year' }).selectOption('2020');
  await page.getByRole('combobox', { name: 'Catalog' }).selectOption('2019-2020');
  await page.getByRole('combobox', { name: 'Major' }).selectOption('Computer Engineering');
  await page
    .getByRole('combobox', { name: 'Concentration' })
    .selectOption('Not Applicable For This Major');
  await page.getByRole('checkbox', { name: 'Remove GE Courses' }).click({ force: true });
  await expect(page.getByRole('button', { name: 'Create' })).toBeEnabled();

  // close modal and verify its gone
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Create New Flowchart')).not.toBeVisible();

  // re-open, see that all inputs are empty
  await page.getByRole('button', { name: 'New Flow' }).click();
  await expect(page.getByText('Create New Flowchart')).toBeVisible();

  await expect(page.getByRole('textbox', { name: 'Flow Name' })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Starting Year' })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Catalog' })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Major' })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Concentration' })).toHaveValue('');
  await expect(page.getByRole('checkbox', { name: 'Remove GE Courses' })).not.toBeChecked();
  await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();

  // close modal and verify its gone
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Create New Flowchart')).not.toBeVisible();
}
