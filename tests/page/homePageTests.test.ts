import { expect, test } from '@playwright/test';
import { checkCarouselSlide } from '../util/homeCarouselTestUtil';

test.describe('homepage tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage has expected h1', async ({ page }) => {
    expect((await page.textContent('h1'))?.trim()).toBe('Welcome to PolyFlowBuilder!');
  });

  test('homepage has expected first image', async ({ page }) => {
    await checkCarouselSlide(page, 0);
  });

  test('carousel cycles images over time automatically', async ({ page }) => {
    await page.waitForTimeout(7500);
    await checkCarouselSlide(page, 1);
  });

  test('carousel cycles images over time automatically on soft load', async ({ page }) => {
    await page
      .getByRole('link', {
        name: 'Submit Feedback'
      })
      .click();
    await page.getByAltText('PolyFlowBuilder logo').click();

    await page.waitForTimeout(7500);
    await checkCarouselSlide(page, 1);
  });

  test('clicking slide button goes to correct slide', async ({ page }) => {
    const buttons = await page.locator('div[data-twe-carousel-indicators] > button').all();

    // click random button
    const randIdx = Math.floor(Math.random() * buttons.length);
    console.log('going to slide', randIdx);
    await buttons[randIdx].click();

    // check for the correct slide
    await page.waitForTimeout(1000);
    await checkCarouselSlide(page, randIdx);
  });
});
