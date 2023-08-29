import type { Page } from '@playwright/test';

export const FLOW_LIST_ITEM_SELECTOR = '.flowInfoPanel section > div > div';
export const FLOW_LIST_ITEM_SELECTED_SELECTOR = 'section > div > div.card.selected';
export const TERM_CONTAINER_SELECTOR = '.termContainer';
export const TERM_CONTAINER_COURSES_SELECTOR = 'section > div > div';
export const CATALOG_SEARCH_COURSES_SELECTOR =
  '.flowInfoPanel > div.card-body > div > div > div.mutableForEachContainer > section > div > div';

export function getTermContainerCourseLocator(page: Page, pos: [number, number]) {
  return page
    .locator(TERM_CONTAINER_SELECTOR)
    .nth(pos[0])
    .locator(TERM_CONTAINER_COURSES_SELECTOR)
    .nth(pos[1]);
}
