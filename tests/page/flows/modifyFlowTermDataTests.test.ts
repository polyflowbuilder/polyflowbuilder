import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { populateFlowcharts } from 'tests/util/userDataTestUtil.js';
import { performLoginFrontend } from 'tests/util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { dragAndDrop, skipWelcomeMessage } from 'tests/util/frontendInteractionUtil.js';
import {
  FLOW_LIST_ITEM_SELECTOR,
  TERM_CONTAINER_SELECTOR,
  getTermContainerCourseLocator,
  TERM_CONTAINER_COURSES_SELECTOR
} from 'tests/util/selectorTestUtil.js';

// TODO: include tests that customize courses
// TODO: include tests that add new courses to terms
// TODO: include credit bin tests once we add visibility toggle

const MODIFY_FLOW_TERM_DATA_TESTS_EMAIL = 'pfb_test_flowsPage_modifyTermData_playwright@test.com';

test.describe('FLOW_TERM_MOD update tests', () => {
  const prisma = new PrismaClient();
  let userId: string;

  test.beforeAll(async () => {
    // create account
    const id = await createUser({
      email: MODIFY_FLOW_TERM_DATA_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null');
    }

    userId = id;
  });

  test.beforeEach(async ({ page }) => {
    await skipWelcomeMessage(page);
    await prisma.dBFlowchart.deleteMany({
      where: {
        ownerId: userId
      }
    });

    // create flowcharts to mess around in
    await populateFlowcharts(prisma, userId, 1, [
      {
        idx: 0,
        info: {
          termCount: 4,
          longTermCount: 2
        }
      }
    ]);
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(MODIFY_FLOW_TERM_DATA_TESTS_EMAIL);
  });

  test('move courses around in single term', async ({ page }, testInfo) => {
    await performLoginFrontend(page, MODIFY_FLOW_TERM_DATA_TESTS_EMAIL, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // load the flowchart
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(1);
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // verify initial order of courses in the first term
    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [0, 1]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [0, 2]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [0, 3]).locator('h6')).toHaveText('MATH96');

    // then move course in the first term
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [0, 0]),
      getTermContainerCourseLocator(page, [0, 1])
    );

    // check correct
    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [0, 1]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [0, 2]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [0, 3]).locator('h6')).toHaveText('MATH96');

    // move more courses around
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [0, 2]),
      getTermContainerCourseLocator(page, [0, 3])
    );
    await dragAndDrop(page, testInfo, getTermContainerCourseLocator(page, [0, 0]), [0, 350]);

    // check
    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [0, 1]).locator('h6')).toHaveText('MATH96');
    await expect(getTermContainerCourseLocator(page, [0, 2]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [0, 3]).locator('h6')).toHaveText('MATH142');

    // reload the page and expect things to be modified still
    await page.reload();

    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(1);
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // check that term state is the same as it was before we reloaded
    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [0, 1]).locator('h6')).toHaveText('MATH96');
    await expect(getTermContainerCourseLocator(page, [0, 2]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [0, 3]).locator('h6')).toHaveText('MATH142');
  });

  test('move courses around in multiple terms', async ({ page }, testInfo) => {
    await performLoginFrontend(page, MODIFY_FLOW_TERM_DATA_TESTS_EMAIL, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // load the flowchart
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(1);
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // move things around
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [4, 0]),
      getTermContainerCourseLocator(page, [1, 0])
    );
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [5, 1]),
      getTermContainerCourseLocator(page, [2, 2])
    );
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [4, 1]),
      getTermContainerCourseLocator(page, [0, 0])
    );

    await getTermContainerCourseLocator(page, [5, 4]).scrollIntoViewIfNeeded();
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [5, 4]),
      getTermContainerCourseLocator(page, [3, 0])
    );

    // now verify the entire flowchart
    // term container 0
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(0).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(5);
    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText('MATH151');
    await expect(getTermContainerCourseLocator(page, [0, 1]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [0, 2]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [0, 3]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [0, 4]).locator('h6')).toHaveText('MATH96');

    // term container 1
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(1).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(5);
    await expect(getTermContainerCourseLocator(page, [1, 0]).locator('h6')).toHaveText(
      'longestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlon'
    );
    await expect(getTermContainerCourseLocator(page, [1, 1]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [1, 2]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [1, 3]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [1, 4]).locator('h6')).toHaveText('MATH96');

    // term container 2
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(2).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(5);
    await expect(getTermContainerCourseLocator(page, [2, 0]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [2, 1]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [2, 2]).locator('h6')).toHaveText(
      '1--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [2, 3]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [2, 4]).locator('h6')).toHaveText('MATH96');

    // term container 3
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(3).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(5);
    await expect(getTermContainerCourseLocator(page, [3, 0]).locator('h6')).toHaveText(
      '3-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [3, 1]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [3, 2]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [3, 3]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [3, 4]).locator('h6')).toHaveText('MATH96');

    // term container 4
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(4).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(8);
    await expect(getTermContainerCourseLocator(page, [4, 0]).locator('h6')).toHaveText(
      '1--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 1]).locator('h6')).toHaveText('MATH118');
    await expect(getTermContainerCourseLocator(page, [4, 2]).locator('h6')).toHaveText(
      '2--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 3]).locator('h6')).toHaveText(
      '3-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 4]).locator('h6')).toHaveText(
      '4-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 5]).locator('h6')).toHaveText(
      '5-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 6]).locator('h6')).toHaveText(
      '6-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 7]).locator('h6')).toHaveText(
      '7-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );

    // term container 5
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(5).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(8);
    await expect(getTermContainerCourseLocator(page, [5, 0]).locator('h6')).toHaveText(
      'longestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlon'
    );
    await expect(getTermContainerCourseLocator(page, [5, 1]).locator('h6')).toHaveText('MATH151');
    await expect(getTermContainerCourseLocator(page, [5, 2]).locator('h6')).toHaveText('MATH118');
    await expect(getTermContainerCourseLocator(page, [5, 3]).locator('h6')).toHaveText(
      '2--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [5, 4]).locator('h6')).toHaveText(
      '4-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [5, 5]).locator('h6')).toHaveText(
      '5-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [5, 6]).locator('h6')).toHaveText(
      '6-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [5, 7]).locator('h6')).toHaveText(
      '7-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );

    // reload and expect things to still be there
    await page.reload();

    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(1);
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // now verify the entire flowchart
    // term container 0
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(0).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(5);
    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText('MATH151');
    await expect(getTermContainerCourseLocator(page, [0, 1]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [0, 2]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [0, 3]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [0, 4]).locator('h6')).toHaveText('MATH96');

    // term container 1
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(1).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(5);
    await expect(getTermContainerCourseLocator(page, [1, 0]).locator('h6')).toHaveText(
      'longestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlon'
    );
    await expect(getTermContainerCourseLocator(page, [1, 1]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [1, 2]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [1, 3]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [1, 4]).locator('h6')).toHaveText('MATH96');

    // term container 2
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(2).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(5);
    await expect(getTermContainerCourseLocator(page, [2, 0]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [2, 1]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [2, 2]).locator('h6')).toHaveText(
      '1--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [2, 3]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [2, 4]).locator('h6')).toHaveText('MATH96');

    // term container 3
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(3).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(5);
    await expect(getTermContainerCourseLocator(page, [3, 0]).locator('h6')).toHaveText(
      '3-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [3, 1]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [3, 2]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [3, 3]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [3, 4]).locator('h6')).toHaveText('MATH96');

    // term container 4
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(4).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(8);
    await expect(getTermContainerCourseLocator(page, [4, 0]).locator('h6')).toHaveText(
      '1--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 1]).locator('h6')).toHaveText('MATH118');
    await expect(getTermContainerCourseLocator(page, [4, 2]).locator('h6')).toHaveText(
      '2--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 3]).locator('h6')).toHaveText(
      '3-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 4]).locator('h6')).toHaveText(
      '4-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 5]).locator('h6')).toHaveText(
      '5-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 6]).locator('h6')).toHaveText(
      '6-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [4, 7]).locator('h6')).toHaveText(
      '7-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );

    // term container 5
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(5).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(8);
    await expect(getTermContainerCourseLocator(page, [5, 0]).locator('h6')).toHaveText(
      'longestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlon'
    );
    await expect(getTermContainerCourseLocator(page, [5, 1]).locator('h6')).toHaveText('MATH151');
    await expect(getTermContainerCourseLocator(page, [5, 2]).locator('h6')).toHaveText('MATH118');
    await expect(getTermContainerCourseLocator(page, [5, 3]).locator('h6')).toHaveText(
      '2--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [5, 4]).locator('h6')).toHaveText(
      '4-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [5, 5]).locator('h6')).toHaveText(
      '5-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [5, 6]).locator('h6')).toHaveText(
      '6-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [5, 7]).locator('h6')).toHaveText(
      '7-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
  });

  test('move course to empty term', async ({ page }, testInfo) => {
    await performLoginFrontend(page, MODIFY_FLOW_TERM_DATA_TESTS_EMAIL, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // load the flowchart
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveCount(1);
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    // verify initial order of courses in the first term
    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText(
      '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
    );
    await expect(getTermContainerCourseLocator(page, [0, 1]).locator('h6')).toHaveText('MATH142');
    await expect(getTermContainerCourseLocator(page, [0, 2]).locator('h6')).toHaveText('MATH153');
    await expect(getTermContainerCourseLocator(page, [0, 3]).locator('h6')).toHaveText('MATH96');

    // move courses out of the first term
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [0, 0]),
      getTermContainerCourseLocator(page, [1, 0])
    );
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [0, 0]),
      getTermContainerCourseLocator(page, [1, 0])
    );
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [0, 0]),
      getTermContainerCourseLocator(page, [1, 0])
    );
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [0, 0]),
      getTermContainerCourseLocator(page, [1, 0]),
      false
    );

    // verify first term is empty
    await expect(
      page.locator(TERM_CONTAINER_SELECTOR).nth(0).locator(TERM_CONTAINER_COURSES_SELECTOR)
    ).toHaveCount(0);

    // move course into empty term
    await dragAndDrop(
      page,
      testInfo,
      getTermContainerCourseLocator(page, [1, 0]),
      page.locator(TERM_CONTAINER_SELECTOR).nth(0)
    );

    // verify course is in first term
    await expect(getTermContainerCourseLocator(page, [0, 0]).locator('h6')).toHaveText('MATH96');
  });
});
