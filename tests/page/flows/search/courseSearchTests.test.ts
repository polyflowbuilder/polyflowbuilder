import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { populateFlowcharts } from 'tests/util/userDataTestUtil.js';
import { performLoginFrontend } from 'tests/util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { dragAndDrop, skipWelcomeMessage } from 'tests/util/frontendInteractionUtil.js';
import {
  FLOW_LIST_ITEM_SELECTOR,
  getTermContainerCourseLocator,
  CATALOG_SEARCH_COURSES_SELECTOR
} from 'tests/util/selectorTestUtil.js';
import type { Page } from '@playwright/test';
import type { CatalogSearchValidFields } from '$lib/server/schema/searchCatalogSchema.js';

const FLOWS_PAGE_COURSE_SEARCH_TESTS_EMAIL = 'pfb_test_flowPage_courseSearch_playwright@test.com';

async function assertCorrectUIAfterCatalogSearch(
  page: Page,
  courseResults: string[],
  searchLimitExceeded = false,
  queryValid = true
) {
  await expect(page.locator('.flowInfoPanel .loading-spinner')).toHaveCount(0);

  // query valid
  await expect(page.locator('.flowInfoPanel .invalidSearchIcon')).toHaveCount(queryValid ? 0 : 1);

  // no results found
  await expect(page.locator('.flowInfoPanel .noResultsIcon')).toHaveCount(
    !courseResults.length && queryValid ? 1 : 0
  );

  // search limit exceeded
  await expect(page.getByText('Search results were capped')).toHaveCount(
    searchLimitExceeded ? 1 : 0
  );

  // the courses themselves
  await expect(page.locator(CATALOG_SEARCH_COURSES_SELECTOR)).toHaveCount(courseResults.length);
  await expect(page.locator(CATALOG_SEARCH_COURSES_SELECTOR)).toHaveText(courseResults);
}

async function assertCorrectCatalogSearch(
  page: Page,
  programIdx: number,
  field: CatalogSearchValidFields,
  query: string,
  courseResults: string[],
  searchLimitExceeded = false,
  queryValid = true
): Promise<void> {
  await performLoginFrontend(page, FLOWS_PAGE_COURSE_SEARCH_TESTS_EMAIL, 'test');
  await expect(page).toHaveURL(/.*flows/);
  expect((await page.textContent('h2'))?.trim()).toBe('Flows');
  expect((await page.context().cookies())[0].name).toBe('sId');

  // make sure test flows exist
  await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText(['test flow 0', 'test flow 1']);

  // select flow
  await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
  await expect(
    page.getByRole('heading', {
      name: 'test flow 0'
    })
  ).toBeInViewport();

  // go over to course search tab
  await page
    .getByRole('link', {
      name: 'Add Courses'
    })
    .click();

  // select program
  await page
    .getByRole('combobox', {
      name: 'course search program selector'
    })
    .selectOption({
      index: programIdx
    });

  // select query field type
  await page
    .getByRole('combobox', {
      name: 'course search field selector'
    })
    .selectOption(field);

  // expect no search results yet
  await expect(page.locator(CATALOG_SEARCH_COURSES_SELECTOR)).toHaveCount(0);

  // perform a search and expect request to go out bc its a new search
  // wrap outgoing call in small delay so we can detect loading
  let failOnRoute = false;
  await page.route(/\/api\/data\/searchCatalog/, async (route) => {
    if (failOnRoute) {
      throw new Error('unexpected request to searchCatalog intercepted');
    }

    await new Promise((r) => setTimeout(r, 500));
    await route.continue();
  });
  const responsePromise = page.waitForResponse(/\/api\/data\/searchCatalog/);
  await page
    .getByRole('searchbox', {
      name: 'course search query input'
    })
    .fill(query);
  await expect(page.locator('.flowInfoPanel .loading-spinner')).toHaveCount(1);
  const response = await responsePromise;

  // done, check response
  const resJson: unknown = await response.json();
  expect(response.ok()).toBe(queryValid);
  expect(resJson).toHaveProperty('message');
  if (queryValid) {
    expect(resJson).toHaveProperty('results');
  }

  // expect UI to be updated correctly
  await assertCorrectUIAfterCatalogSearch(page, courseResults, searchLimitExceeded, queryValid);

  // now reset
  await page
    .getByRole('searchbox', {
      name: 'course search query input'
    })
    .fill('');
  await expect(page.locator(CATALOG_SEARCH_COURSES_SELECTOR)).toHaveCount(0);

  // perform search again, but should fetch from cache instead
  failOnRoute = true;
  await page
    .getByRole('searchbox', {
      name: 'course search query input'
    })
    .fill(query);

  // expect UI to be restored from cache with correct courses and order
  await assertCorrectUIAfterCatalogSearch(page, courseResults, searchLimitExceeded, queryValid);
}

test.describe('course search tests', () => {
  const prisma = new PrismaClient();
  let userId: string;

  test.beforeAll(async () => {
    // create account
    const id = await createUser({
      email: FLOWS_PAGE_COURSE_SEARCH_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null');
    }

    userId = id;

    // create flowcharts to mess around in
    await populateFlowcharts(prisma, userId, 2, [
      {
        idx: 1,
        info: {
          termCount: 1,
          longTermCount: 0,
          programCount: 2
        }
      }
    ]);
  });

  test.beforeEach(async ({ page }) => {
    await skipWelcomeMessage(page);
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(FLOWS_PAGE_COURSE_SEARCH_TESTS_EMAIL);
  });

  test('invalid query UI on displayName field works properly', async ({ page }) => {
    await assertCorrectCatalogSearch(page, 0, 'displayName', '++data', [], false, false);
  });

  test('catalog search on displayName field works properly (zero results)', async ({ page }) => {
    await assertCorrectCatalogSearch(page, 0, 'displayName', 'blahblahblahblah', []);
  });

  test('catalog search on displayName field works properly (nonzero, nonmax results)', async ({
    page
  }) => {
    await assertCorrectCatalogSearch(page, 0, 'displayName', '"data science"', [
      'DATA100 Data Science for All I 4 units',
      'DATA301 Introduction to Data Science 4 units',
      'DATA401 Data Science Process and Ethics 3 units',
      'DATA402 Mathematical Foundations of Data Science 3 units',
      'DATA403 Data Science Projects Laboratory 1 unit',
      'DATA451 Data Science Capstone I 2 units',
      'DATA452 Data Science Capstone II 2 units',
      'DATA472 Data Science Seminar 1 unit'
    ]);
  });

  test('catalog search on displayName field works properly (max results)', async ({ page }) => {
    await assertCorrectCatalogSearch(
      page,
      0,
      'displayName',
      'computer',
      [
        'CSC515 Computer Architecture 4 units',
        'CSC570 Current Topics in Computer Science 2-4 units',
        'CSC581 Computer Support for Knowledge Management 4 units',
        'CSC574 Advanced Compute Shaders in Computer Graphics 4 units',
        'CSC572 Computer Graphics 4 units',
        'EE428 Computer Vision 4 units',
        'EE431 Computer-Aided Design of VLSI Devices 4 units',
        'EE521 Computer Systems 4 units',
        'IME335 Computer-Aided Manufacturing I 4 units',
        'IME336 Computer-Aided Manufacturing II 4 units',
        'PHYS202 Physics on the Computer 4 units',
        'EE233 Computer Design and Assembly Language Programming 4 units',
        'CSC521 Computer Security 4 units',
        'CSC564 Computer Networks: Research Topics 4 units',
        'CSC486 Human-Computer Interaction Theory and Design 4 units',
        'CSC478 Current Topics in Computer Graphics 4 units',
        'CSC476 Real-Time 3D Computer Graphics Software 4 units',
        'CSC474 Computer Animation 4 units',
        'CSC471 Introduction to Computer Graphics 4 units',
        'CSC458 Current Topics in Computer Systems 4 units',
        'CSC429 Current Topics in Computer Security 4 units',
        'CSC321 Introduction to Computer Security 4 units',
        'CSC320 Practical Computer Security for Everyone 4 units',
        'CSC232 Computer Programming for Scientists and Engineers 3 units'
      ],
      true,
      true
    );
  });

  test('invalid query UI on id field works properly', async ({ page }) => {
    await assertCorrectCatalogSearch(page, 0, 'id', '++data', [], false, false);
  });

  test('catalog search on id field works properly (zero results)', async ({ page }) => {
    await assertCorrectCatalogSearch(page, 0, 'id', 'blahblahblahblah', []);
  });

  test('catalog search on id field works properly (nonzero, nonmax results)', async ({ page }) => {
    await assertCorrectCatalogSearch(page, 0, 'id', 'data4*', [
      'DATA401 Data Science Process and Ethics 3 units',
      'DATA402 Mathematical Foundations of Data Science 3 units',
      'DATA403 Data Science Projects Laboratory 1 unit',
      'DATA441 Bioinformatics Capstone I 2 units',
      'DATA442 Bioinformatics Capstone II 2 units',
      'DATA451 Data Science Capstone I 2 units',
      'DATA452 Data Science Capstone II 2 units',
      'DATA472 Data Science Seminar 1 unit'
    ]);
  });

  test('catalog search on id field works properly (max results)', async ({ page }) => {
    await assertCorrectCatalogSearch(
      page,
      0,
      'id',
      'cpe*',
      [
        'CPE464 Introduction to Computer Networks 4 units',
        'CPE542 Advanced Real Time Embedded Systems 4 units',
        'CPE521 Computer Systems 4 units',
        'CPE569 Distributed Computing 4 units',
        'CPE564 Computer Networks: Research Topics 4 units',
        'CPE532 VLSI Circuit Testing 1 unit',
        'CPE523 Digital Systems Design 4 units',
        'CPE522 Advanced Real-Time Operating Systems Design 4 units',
        'CPE541 Advanced VLSI Design 4 units',
        'CPE471 Introduction to Computer Graphics 4 units',
        'CPE470 Selected Advanced Topics 1-4 units',
        'CPE469 Distributed Systems 4 units',
        'CPE465 Advanced Computer Networks 4 units',
        'CPE472 Digital Control Systems Laboratory 1 unit',
        'CPE462 Senior Project II 2 units',
        'CPE461 Senior Project I 3 units',
        'CPE458 Current Topics in Computer Systems 4 units',
        'CPE454 Implementation of Operating Systems 4 units',
        'CPE453 Introduction to Operating Systems 4 units',
        'CPE450 Capstone II 3 units',
        'CPE447 Stringed Musical Instrument Acoustics, Mechanics, and Transducer Design 4 units',
        'CPE446 Design of Fault-Tolerant Digital Systems 4 units',
        'CPE442 Real Time Embedded Systems 4 units',
        'CPE441 Computer-Aided Design of VLSI Devices 4 units'
      ],
      true,
      true
    );
  });

  test('adding course to flowchart from search works properly', async ({ page }) => {
    await performLoginFrontend(page, FLOWS_PAGE_COURSE_SEARCH_TESTS_EMAIL, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // make sure test flows exist
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText(['test flow 0', 'test flow 1']);

    // select flow
    await page.locator(FLOW_LIST_ITEM_SELECTOR).last().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 1'
      })
    ).toBeInViewport();

    // go over to course search tab
    await page
      .getByRole('link', {
        name: 'Add Courses'
      })
      .click();

    // expect no search results yet
    await expect(page.locator(CATALOG_SEARCH_COURSES_SELECTOR)).toHaveCount(0);

    // perform a search and expect request to go out bc its a new search
    // wrap outgoing call in small delay so we can detect loading
    await page.route(/\/api\/data\/searchCatalog/, async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.continue();
    });
    const responsePromise = page.waitForResponse(/\/api\/data\/searchCatalog/);
    await page
      .getByRole('searchbox', {
        name: 'course search query input'
      })
      .fill('beekeeping');
    await expect(page.locator('.flowInfoPanel .loading-spinner')).toHaveCount(1);
    const response = await responsePromise;

    // done, check response
    const resJson: unknown = await response.json();
    expect(response.ok()).toBeTruthy();
    expect(resJson).toHaveProperty('message');
    expect(resJson).toHaveProperty('results');

    // expect UI to be updated correctly
    await assertCorrectUIAfterCatalogSearch(page, ['PLSC175 Beekeeping 3 units'], false, true);

    // now drag this course into a term container
    await dragAndDrop(
      page,
      page.locator(CATALOG_SEARCH_COURSES_SELECTOR).first(),
      getTermContainerCourseLocator(page, [0, 1])
    );

    // verify the course was put there correctly
    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [0, 1]).locator('h6')).toHaveText('PLSC175');
    await expect(getTermContainerCourseLocator(page, [0, 2]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [0, 3]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [0, 4]).locator('h6')).toHaveText('MATH96');

    // verify that course is still in the search results
    await assertCorrectUIAfterCatalogSearch(page, ['PLSC175 Beekeeping 3 units'], false, true);

    // now refresh and expect it to persist
    await page.reload();

    // select flow
    await page.locator(FLOW_LIST_ITEM_SELECTOR).last().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 1'
      })
    ).toBeInViewport();

    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [0, 1]).locator('h6')).toHaveText('PLSC175');
    await expect(getTermContainerCourseLocator(page, [0, 2]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [0, 3]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [0, 4]).locator('h6')).toHaveText('MATH96');
  });
});
