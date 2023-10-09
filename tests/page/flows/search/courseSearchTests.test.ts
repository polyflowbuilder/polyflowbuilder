import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { populateFlowcharts } from 'tests/util/userDataTestUtil';
import { createUser, deleteUser } from '$lib/server/db/user';
import { dragAndDrop, skipWelcomeMessage } from 'tests/util/frontendInteractionUtil';
import { getUserEmailString, performLoginFrontend } from 'tests/util/userTestUtil';
import {
  TERM_CONTAINER_SELECTOR,
  FLOW_LIST_ITEM_SELECTOR,
  getTermContainerCourseLocator,
  CATALOG_SEARCH_COURSES_SELECTOR
} from 'tests/util/selectorTestUtil';
import type { Page } from '@playwright/test';
import type { CatalogSearchValidFields } from '$lib/server/schema/searchCatalogSchema';

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
  userEmail: string,
  programIdx: number,
  field: CatalogSearchValidFields,
  query: string,
  courseResults: string[],
  searchLimitExceeded = false,
  queryValid = true
): Promise<void> {
  await performLoginFrontend(page, userEmail, 'test');
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
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString('pfb_test_flowPage_courseSearch_playwright@test.com', testInfo);
    const id = await createUser({
      email: userEmail,
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
    await deleteUser(userEmail);
  });

  test('invalid query UI on displayName field works properly', async ({ page }) => {
    await assertCorrectCatalogSearch(page, userEmail, 0, 'displayName', '++data', [], false, false);
  });

  test('catalog search on displayName field works properly (zero results)', async ({ page }) => {
    await assertCorrectCatalogSearch(page, userEmail, 0, 'displayName', 'blahblahblahblah', []);
  });

  test('catalog search on displayName field works properly (nonzero, nonmax results)', async ({
    page
  }) => {
    await assertCorrectCatalogSearch(page, userEmail, 0, 'displayName', '"data science"', [
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
      userEmail,
      0,
      'displayName',
      'computer',
      [
        'AGED410 Computer Applications in Agricultural Education 2 units',
        'ARCH460 Computer Applications 3 units',
        'ARCH461 Advanced Computer-Aided Fabrication in Architecture 4 units',
        'ASCI450 Computer Applications in Animal Science: Spreadsheet Analysis 4 units',
        'BRAE328 Measurements and Computer Interfacing 4 units',
        'BRAE425 Computer Controls for Agriculture 3 units',
        'BUS441 Computer Applications in Finance 4 units',
        'CE113 Computer Aided Drafting in Civil Engineering 2 units',
        'CE413 Advanced Civil Computer-Aided Site Design 2 units',
        'CE536 Computer Applications in Water Resources with Geographic Info Systems (GIS) 4 units',
        'CPE100 Computer Engineering Orientation 1 unit',
        'CPE101 Fundamentals of Computer Science 4 units',
        'CPE225 Introduction to Computer Organization 4 units',
        'CPE233 Computer Design and Assembly Language Programming 4 units',
        'CPE315 Computer Architecture 4 units',
        'CPE321 Introduction to Computer Security 4 units',
        'CPE333 Computer Hardware Architecture and Design 4 units',
        'CPE428 Computer Vision 4 units',
        'CPE441 Computer-Aided Design of VLSI Devices 4 units',
        'CPE458 Current Topics in Computer Systems 4 units',
        'CPE464 Introduction to Computer Networks 4 units',
        'CPE465 Advanced Computer Networks 4 units',
        'CPE471 Introduction to Computer Graphics 4 units',
        'CPE476 Real-Time 3D Computer Graphics Software 4 units'
      ],
      true,
      true
    );
  });

  test('invalid query UI on id field works properly', async ({ page }) => {
    await assertCorrectCatalogSearch(page, userEmail, 0, 'id', '++data', [], false, false);
  });

  test('catalog search on id field works properly (zero results)', async ({ page }) => {
    await assertCorrectCatalogSearch(page, userEmail, 0, 'id', 'blahblahblahblah', []);
  });

  test('catalog search on id field works properly (nonzero, nonmax results)', async ({ page }) => {
    await assertCorrectCatalogSearch(page, userEmail, 0, 'id', 'data4*', [
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
      userEmail,
      0,
      'id',
      'cpe*',
      [
        'CPE100 Computer Engineering Orientation 1 unit',
        'CPE101 Fundamentals of Computer Science 4 units',
        'CPE123 Introduction to Computing 4 units',
        'CPE133 Digital Design 4 units',
        'CPE200 Special Problems for Undergraduates 1-2 units',
        'CPE202 Data Structures 4 units',
        'CPE203 Project-Based Object-Oriented Programming and Design 4 units',
        'CPE225 Introduction to Computer Organization 4 units',
        'CPE233 Computer Design and Assembly Language Programming 4 units',
        'CPE290 Selected Topics 1-4 units',
        'CPE315 Computer Architecture 4 units',
        'CPE316 Microcontrollers and Embedded Applications 4 units',
        'CPE321 Introduction to Computer Security 4 units',
        'CPE327 Digital Signals and Systems 3 units',
        'CPE328 Discrete Time Signals and Systems 3 units',
        'CPE329 Microcontroller-Based Systems Design 4 units',
        'CPE333 Computer Hardware Architecture and Design 4 units',
        'CPE336 Microprocessor System Design 4 units',
        'CPE345 Quantum Computing 4 units',
        'CPE350 Capstone I 4 units',
        'CPE357 Systems Programming 4 units',
        'CPE367 Digital Signals and Systems Laboratory 1 unit',
        'CPE368 Signals and Systems Laboratory 1 unit',
        'CPE400 Special Problems for Undergraduates 1-4 units'
      ],
      true,
      true
    );
  });

  test('adding course to flowchart from search works properly (already populated term)', async ({
    page
  }, testInfo) => {
    await performLoginFrontend(page, userEmail, 'test');
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
      .fill('plsc175');
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
      testInfo,
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

  test('adding course to flowchart from search works properly (empty term)', async ({
    page
  }, testInfo) => {
    await performLoginFrontend(page, userEmail, 'test');
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

    // add empty term (see addFlowTermsTests)
    await page
      .getByText('Actions', {
        exact: true
      })
      .click();
    await page
      .getByText('Add Terms', {
        exact: true
      })
      .click();
    await page
      .getByRole('listbox', {
        name: 'select flowchart terms to add'
      })
      .selectOption('Summer 2020');
    await page
      .getByRole('button', {
        name: 'Add Terms to Flowchart'
      })
      .click();
    await expect(page.locator(TERM_CONTAINER_SELECTOR)).toHaveCount(1);

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
      .fill('PlSc175');
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
      testInfo,
      page.locator(CATALOG_SEARCH_COURSES_SELECTOR).first(),
      page.locator(TERM_CONTAINER_SELECTOR).nth(0)
    );

    // verify the course was put there correctly
    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText('PLSC175');

    // verify that course is still in the search results
    await assertCorrectUIAfterCatalogSearch(page, ['PLSC175 Beekeeping 3 units'], false, true);

    // now refresh and expect it to persist
    await page.reload();

    // select flow
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText('PLSC175');
  });
});
