import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { skipWelcomeMessage } from 'tests/util/frontendInteractionUtil.js';
import { populateFlowcharts } from 'tests/util/userDataTestUtil.js';
import { performLoginFrontend } from 'tests/util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { FLOW_LIST_ITEM_SELECTOR } from 'tests/util/selectorTestUtil.js';

const FLOWS_PAGE_COURSE_SEARCH_OPTIONS_TESTS_EMAIL =
  'pfb_test_flowPage_courseSearchOptions_playwright@test.com';

// put these tests here instead of w/ component bc this component uses
// a lot of stores and setting up state is easier when doing it in an e2e env
test.describe('CourseSearchOptionsSelector tests', () => {
  const prisma = new PrismaClient();
  let userId: string;

  test.beforeAll(async () => {
    // create account
    const id = await createUser({
      email: FLOWS_PAGE_COURSE_SEARCH_OPTIONS_TESTS_EMAIL,
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
    await deleteUser(FLOWS_PAGE_COURSE_SEARCH_OPTIONS_TESTS_EMAIL);
  });

  test('course search program selector is disabled when no flowchart is selected', async ({
    page
  }) => {
    await performLoginFrontend(page, FLOWS_PAGE_COURSE_SEARCH_OPTIONS_TESTS_EMAIL, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // make sure test flows exist
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText(['test flow 0', 'test flow 1']);

    // go over to course search tab
    await page
      .getByRole('link', {
        name: 'Add Courses'
      })
      .click();

    // expect default state of program selector
    const courseSearchProgramSelector = page.getByRole('combobox', {
      name: 'course search program selector'
    });

    await expect(courseSearchProgramSelector).toBeVisible();
    await expect(courseSearchProgramSelector).toBeInViewport();
    await expect(courseSearchProgramSelector).toBeDisabled();
    await expect(courseSearchProgramSelector).toHaveText('Select a Flowchart');
    await expect(courseSearchProgramSelector).toHaveValue('-1');

    // expect default state of field selector
    const courseSearchFieldSelector = page.getByRole('combobox', {
      name: 'course search field selector'
    });

    await expect(courseSearchFieldSelector).toBeVisible();
    await expect(courseSearchFieldSelector).toBeInViewport();
    await expect(courseSearchFieldSelector).toBeDisabled();
    await expect(courseSearchFieldSelector).toHaveValue('displayName');

    // expect default state of query box
    const courseSearchQueryBox = page.getByRole('searchbox', {
      name: 'course search query input'
    });

    await expect(courseSearchQueryBox).toBeVisible();
    await expect(courseSearchQueryBox).toBeInViewport();
    await expect(courseSearchQueryBox).toBeDisabled();
    await expect(courseSearchQueryBox).toHaveValue('');
  });

  test('course search program selector only has one option w/ flowchart that has one program', async ({
    page
  }) => {
    await performLoginFrontend(page, FLOWS_PAGE_COURSE_SEARCH_OPTIONS_TESTS_EMAIL, 'test');
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

    // now check our course search UI
    const courseSearchProgramSelector = page.getByRole('combobox', {
      name: 'course search program selector'
    });

    await expect(courseSearchProgramSelector).toBeVisible();
    await expect(courseSearchProgramSelector).toBeInViewport();
    await expect(courseSearchProgramSelector).toBeEnabled();
    await expect(courseSearchProgramSelector).toHaveText(
      '2022-2026 - Aerospace Engineering - Astronautics'
    );
    await expect(courseSearchProgramSelector).toHaveValue('0');

    const courseSearchFieldSelector = page.getByRole('combobox', {
      name: 'course search field selector'
    });

    await expect(courseSearchFieldSelector).toBeVisible();
    await expect(courseSearchFieldSelector).toBeInViewport();
    await expect(courseSearchFieldSelector).toBeEnabled();
    await expect(courseSearchFieldSelector).toHaveValue('displayName');

    const courseSearchQueryBox = page.getByRole('searchbox', {
      name: 'course search query input'
    });

    await expect(courseSearchQueryBox).toBeVisible();
    await expect(courseSearchQueryBox).toBeInViewport();
    await expect(courseSearchQueryBox).toBeEnabled();
    await expect(courseSearchQueryBox).toHaveValue('');
  });

  test('course search program selector has shows multiple options w/ flowchart that has multiple programs', async ({
    page
  }) => {
    await performLoginFrontend(page, FLOWS_PAGE_COURSE_SEARCH_OPTIONS_TESTS_EMAIL, 'test');
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

    // now check our course search UI
    const courseSearchProgramSelector = page.getByRole('combobox', {
      name: 'course search program selector'
    });

    await expect(courseSearchProgramSelector).toBeVisible();
    await expect(courseSearchProgramSelector).toBeInViewport();
    await expect(courseSearchProgramSelector).toBeEnabled();

    // make sure the correct options are visible and selected
    await expect(courseSearchProgramSelector.locator('option')).toHaveText([
      '2022-2026 - Aerospace Engineering - Astronautics',
      '2017-2019 - Journalism - Not Applicable For This Major'
    ]);
    await expect(courseSearchProgramSelector).toHaveValue('0');

    const courseSearchFieldSelector = page.getByRole('combobox', {
      name: 'course search field selector'
    });

    await expect(courseSearchFieldSelector).toBeVisible();
    await expect(courseSearchFieldSelector).toBeInViewport();
    await expect(courseSearchFieldSelector).toBeEnabled();
    await expect(courseSearchFieldSelector).toHaveValue('displayName');

    const courseSearchQueryBox = page.getByRole('searchbox', {
      name: 'course search query input'
    });

    await expect(courseSearchQueryBox).toBeVisible();
    await expect(courseSearchQueryBox).toBeInViewport();
    await expect(courseSearchQueryBox).toBeEnabled();
    await expect(courseSearchQueryBox).toHaveValue('');
  });

  test('switching flowcharts resets query term', async ({ page }) => {
    await performLoginFrontend(page, FLOWS_PAGE_COURSE_SEARCH_OPTIONS_TESTS_EMAIL, 'test');
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

    // adjust field selector
    await page
      .getByRole('combobox', {
        name: 'course search field selector'
      })
      .selectOption('id');

    // fill in search with some value
    await page
      .getByRole('searchbox', {
        name: 'course search query input'
      })
      .fill('test input');

    // make sure correct amount of options are populated
    await expect(
      page
        .getByRole('combobox', {
          name: 'course search program selector'
        })
        .locator('option')
    ).toHaveCount(1);

    // now switch flowcharts
    await page
      .getByRole('link', {
        name: 'Manage Flows'
      })
      .click();

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

    // make sure that the text is gone and program options changed
    await expect(
      page.getByRole('combobox', {
        name: 'course search field selector'
      })
    ).toHaveValue('displayName');

    await expect(
      page.getByRole('searchbox', {
        name: 'course search query input'
      })
    ).toHaveValue('');

    await expect(
      page
        .getByRole('combobox', {
          name: 'course search program selector'
        })
        .locator('option')
    ).toHaveCount(2);
  });
});
