import { expect } from '@playwright/test';
import { homeCarouselImageData } from '$lib/config/homeCarouselConfig';
import type { Page } from '@playwright/test';

// run tests to verify a certain carousel slide is visible to the user
export async function checkCarouselSlide(page: Page, slideIndex: number) {
  const slideImage = page.locator('.carousel-item.active > div > img');
  const slideImageContainer = page.locator('.carousel-item.active');

  // ensure visible
  expect(slideImage).toBeVisible();

  // check image source
  expect(await slideImage.getAttribute('src')).toBe(homeCarouselImageData[slideIndex].src);

  // check alt
  expect(await slideImage.getAttribute('alt')).toBe(homeCarouselImageData[slideIndex].title);

  // check text descriptions
  expect(await slideImageContainer.innerText()).toBe(
    `${homeCarouselImageData[slideIndex].title}\n\n${homeCarouselImageData[slideIndex].desc}`
  );
}
