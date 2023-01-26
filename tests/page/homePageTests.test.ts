// NOTE: need ignores bc we need the .ts extension for Playwright
// see https://playwright.dev/docs/test-typescript#typescript-with-esm

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { checkCarouselSlide } from '../util/homeCarouselTestUtil.ts';

import { expect, test } from '@playwright/test';

test.describe('homepage tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage has expected h1', async ({ page }) => {
    expect(await page.textContent('h1')).toBe('Welcome to PolyFlowBuilder!');
  });

  test('homepage has expected first image', async ({ page }) => {
    await checkCarouselSlide(page, 0);
  });

  test('carousel cycles images over time automatically', async ({ page }) => {
    await page.waitForTimeout(7500);
    await checkCarouselSlide(page, 1);
  });

  test('clicking slide button goes to correct slide', async ({ page }) => {
    const buttons = await page.locator('.carousel-indicators > button').all();

    // click random button
    const randIdx = Math.floor(Math.random() * buttons.length);
    console.log('going to slide', randIdx);
    await buttons[randIdx].click();

    // check for the correct slide
    await page.waitForTimeout(1000);
    await checkCarouselSlide(page, randIdx);
  });
});
