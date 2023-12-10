import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const FEEDBACK_CONTENT = 'test_feedback_pfb_+wledkcvmwlekm32rj498r3fmkldmclkmlkc';

test.describe('feedback page tests', () => {
  test.describe.configure({
    mode: 'serial'
  });
  const prisma = new PrismaClient();

  test.beforeEach(async ({ page }) => {
    await page.goto('/feedback');
  });

  test.afterAll(async () => {
    console.log('deleting test feedback submissions');
    await prisma.feedbackReport.deleteMany({
      where: {
        feedback: FEEDBACK_CONTENT
      }
    });
  });

  test('feedback page has expected content', async ({ page }) => {
    expect((await page.textContent('h2'))?.trim()).toBe('Submit Feedback');
    await expect(page.locator('button')).toBeVisible();
  });

  test('feedback succeeds without email', async ({ page }) => {
    await page.getByLabel('feedback').fill(FEEDBACK_CONTENT);
    await page.getByRole('button', { name: 'Submit Feedback' }).click();

    await expect(page.locator('.alert-success')).toBeVisible();
  });

  test('feedback fails with invalid email (type 1)', async ({ page }) => {
    await page.getByLabel('email').fill('invalidemail');
    await page.getByLabel('feedback').fill(FEEDBACK_CONTENT);
    await page.getByRole('button', { name: 'Submit Feedback' }).click();

    // with the way the submit feedback form works, we don't have any
    // error validation that manipulates the DOM, so just check that the
    // field is marked as required and trust that the browser will display
    // the error
    // see https://stackoverflow.com/questions/74408030/playwright-test-test-that-input-is-required
    // TODO: add error validation that we can test with Playwright
    await expect(page.locator('input#email:invalid')).toBeVisible();
  });

  test('feedback fails with invalid email (type 2)', async ({ page }) => {
    await page.getByLabel('email').fill('invalidemail@test');

    // TODO: test flaky bc sometimes this fill FAILS TO FILL!
    await page.getByLabel('feedback').fill(FEEDBACK_CONTENT);
    await page.getByRole('button', { name: 'Submit Feedback' }).click();

    await expect(page.locator('#emailError')).toBeVisible();
    await expect(page.locator('#emailError')).toHaveText('Email must be a valid email address.');
  });

  test('feedback succeeds with valid email', async ({ page }) => {
    await page.getByLabel('email').fill('test@test.com');
    await page.getByLabel('feedback').fill(FEEDBACK_CONTENT);
    await page.getByRole('button', { name: 'Submit Feedback' }).click();

    await expect(page.locator('.alert-success')).toBeVisible();

    // check for existence in DB
    const res = await prisma.feedbackReport.findFirst({
      where: {
        feedback: FEEDBACK_CONTENT
      },
      select: {
        id: true
      }
    });
    expect(res).toBeTruthy();
  });

  test('500 error feedback fails for some reason', async ({ page }) => {
    // mock 500 invalid response
    await page.route('/feedback', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: String.raw`{"type":"failure","status":500,"data":"[{\"error\":1},true]"}`
      });
    });

    await page.getByLabel('email').fill('test@test.com');
    await page.getByLabel('feedback').fill(FEEDBACK_CONTENT);
    await page.getByRole('button', { name: 'Submit Feedback' }).click();

    await expect(page.locator('.alert-error')).toBeVisible();
    await expect(page.locator('.alert-error')).toHaveText(
      'An error occurred while trying to submit feedback. Please try again a bit later.'
    );
  });
});
