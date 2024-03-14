import { expect } from '@playwright/test';
import { homeCarouselImageData } from '$lib/common/config/homeCarouselConfig';
import type { Page } from '@playwright/test';

// run tests to verify a certain carousel slide is visible to the user
export async function checkCarouselSlide(page: Page, slideIndex: number) {
  const slideImage = page.locator('.carouselItem[data-twe-carousel-active] > div > img');
  const slideImageContainer = page.locator('.carouselItem[data-twe-carousel-active]');

  // check image source
  expect(await slideImage.getAttribute('src')).toBe(homeCarouselImageData[slideIndex].src);

  // check alt
  expect(await slideImage.getAttribute('alt')).toBe(homeCarouselImageData[slideIndex].title);

  // check text descriptions
  expect(await slideImageContainer.textContent()).toBe(
    ` ${homeCarouselImageData[slideIndex].title} ${homeCarouselImageData[slideIndex].desc} `
  );

  // ensure visible
  await expect(slideImage).toBeVisible();
}
