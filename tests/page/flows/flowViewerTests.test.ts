import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { skipWelcomeMessage } from 'tests/util/frontendInteractionUtil.js';
import { populateFlowcharts } from 'tests/util/userDataTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { FLOW_LIST_ITEM_SELECTOR } from 'tests/util/selectorTestUtil.js';
import { getUserEmailString, performLoginFrontend } from 'tests/util/userTestUtil.js';

test.describe('flowchart viewer tests', () => {
  const prisma = new PrismaClient();
  let userId: string;
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString('pfb_test_flowPage_flowViewer_playwright@test.com', testInfo);
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
    await populateFlowcharts(prisma, userId, 4, [
      {
        idx: 2,
        info: {
          termCount: 4,
          longTermCount: 2
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

  test('no flowchart selected state correct', async ({ page }) => {
    await performLoginFrontend(page, userEmail, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // make sure test flows exist
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3'
    ]);

    // verify correct state when no flowchart selected
    await expect(
      page.getByText('No flow selected. Please select or create a flow.')
    ).toBeInViewport();
  });

  test('selected flowchart loads correctly into editor (no quarters)', async ({ page }) => {
    await page.setViewportSize({
      width: 1920,
      height: 1080
    });

    await performLoginFrontend(page, userEmail, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // make sure test flows exist
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3'
    ]);

    // verify correct state when no flowchart selected
    await expect(
      page.getByText('No flow selected. Please select or create a flow.')
    ).toBeInViewport();

    // pick one
    await page.locator(FLOW_LIST_ITEM_SELECTOR).first().click();

    // verify that the editor loaded the selected flowchart properly

    // header
    await expect(
      page.getByRole('heading', {
        name: 'test flow 0'
      })
    ).toBeInViewport();

    await expect(page.getByLabel('flow editor left scroll')).toBeInViewport();
    await expect(page.getByLabel('flow editor left scroll')).toBeDisabled();

    await expect(page.getByLabel('flow editor right scroll')).toBeInViewport();
    await expect(page.getByLabel('flow editor right scroll')).toBeDisabled();

    // body
    await expect(
      page.getByText(
        'This flow does not have any terms. Add terms by clicking "Actions", then "Add Terms".'
      )
    ).toBeInViewport();

    // footer
    await expect(page.getByText('Major: 0')).toBeInViewport();
    await expect(page.getByText('Support: 0')).toBeInViewport();
    await expect(page.getByText('Concentration #1: 0')).toBeInViewport();
    await expect(page.getByText('Concentration #2: 0')).toBeInViewport();
    await expect(page.getByText('GE: 0')).toBeInViewport();
    await expect(page.getByText('Free Elective: 0')).toBeInViewport();
    await expect(page.getByText('Other: 0')).toBeInViewport();
    await expect(page.getByText('Total Units: 0')).toBeInViewport();
  });

  test('selected flowchart loads correctly into editor (some quarters)', async ({ page }) => {
    await page.setViewportSize({
      width: 1920,
      height: 720
    });

    await performLoginFrontend(page, userEmail, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // make sure test flows exist
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3'
    ]);

    // verify correct state when no flowchart selected
    await expect(
      page.getByText('No flow selected. Please select or create a flow.')
    ).toBeInViewport();

    // pick one
    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2).click();

    // verify that the editor loaded the selected flowchart properly

    // header
    await expect(
      page.getByRole('heading', {
        name: 'test flow 2'
      })
    ).toBeInViewport();

    await expect(page.getByLabel('flow editor left scroll')).toBeInViewport();
    await expect(page.getByLabel('flow editor left scroll')).toBeDisabled();

    await expect(page.getByLabel('flow editor right scroll')).toBeInViewport();
    await expect(page.getByLabel('flow editor right scroll')).toBeDisabled();

    // body
    await expect(
      page.getByText(
        'This flow does not have any terms. Add terms by clicking "Actions", then "Add Terms".'
      )
    ).not.toBeVisible();

    // term containers
    await expect(
      page.getByRole('heading', {
        name: 'Summer 2020'
      })
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', {
        name: 'Fall 2020'
      })
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', {
        name: 'Winter 2021'
      })
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', {
        name: 'Spring 2021'
      })
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', {
        name: 'Summer 2021'
      })
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', {
        name: 'Fall 2021'
      })
    ).toBeInViewport();

    // courses

    // visible in regular containers
    await expect(
      page
        .getByText(
          '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(0)
    ).toBeInViewport();
    await expect(page.getByText('MATH142').nth(1)).toBeInViewport();
    await expect(page.getByText('MATH153').nth(2)).toBeInViewport();
    await expect(page.getByText('MATH96').nth(3)).toBeInViewport();

    // courses that have to be scrolled to see
    await expect(
      page
        .getByText(
          '2--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(0)
    ).toBeVisible();
    await expect(
      page
        .getByText(
          '2--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(0)
    ).not.toBeInViewport();

    await expect(
      page
        .getByText(
          '7-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(1)
    ).toBeVisible();
    await expect(
      page
        .getByText(
          '7-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(1)
    ).not.toBeInViewport();

    await expect(page.getByText('13 (4)').nth(0)).toBeInViewport();
    await expect(page.getByText('13 (4)').nth(1)).toBeInViewport();
    await expect(page.getByText('13 (4)').nth(2)).toBeInViewport();
    await expect(page.getByText('13 (4)').nth(3)).toBeInViewport();
    await expect(page.getByText('45 (10)').nth(0)).toBeInViewport();
    await expect(page.getByText('45 (10)').nth(1)).toBeInViewport();

    // footer
    await expect(page.getByText('Major: 16')).toBeInViewport();
    await expect(page.getByText('Support: 14')).toBeInViewport();
    await expect(page.getByText('Concentration #1: 22')).toBeInViewport();
    await expect(page.getByText('Concentration #2: 10')).toBeInViewport();
    await expect(page.getByText('GE: 20')).toBeInViewport();
    await expect(page.getByText('Free Elective: 20')).toBeInViewport();
    await expect(page.getByText('Other: 40')).toBeInViewport();
    await expect(page.getByText('Total Units: 142')).toBeInViewport();
  });

  test('selected flowchart loads correctly into editor (some quarters, header flow scrolling)', async ({
    page
  }, testInfo) => {
    await page.setViewportSize({
      width: 992,
      height: 720
    });

    await performLoginFrontend(page, userEmail, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // make sure test flows exist
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3'
    ]);

    // verify correct state when no flowchart selected
    await expect(
      page.getByText('No flow selected. Please select or create a flow.')
    ).toBeInViewport();

    // pick one
    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2).click();

    // verify that the editor loaded the selected flowchart properly

    // header
    await expect(
      page.getByRole('heading', {
        name: 'test flow 2'
      })
    ).toBeInViewport();

    await expect(page.getByLabel('flow editor left scroll')).toBeInViewport();
    await expect(page.getByLabel('flow editor left scroll')).toBeDisabled();

    await expect(page.getByLabel('flow editor right scroll')).toBeInViewport();
    await expect(page.getByLabel('flow editor right scroll')).toBeEnabled();

    // body
    await expect(
      page.getByText(
        'This flow does not have any terms. Add terms by clicking "Actions", then "Add Terms".'
      )
    ).not.toBeVisible();

    // term containers
    await expect(
      page.getByRole('heading', {
        name: 'Summer 2020'
      })
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', {
        name: 'Fall 2020'
      })
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', {
        name: 'Winter 2021'
      })
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', {
        name: 'Spring 2021'
      })
    ).toBeInViewport();
    await expect(
      page.getByRole('heading', {
        name: 'Summer 2021'
      })
    ).toBeInViewport();

    // can't see the last term
    await expect(
      page.getByRole('heading', {
        name: 'Fall 2021'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'Fall 2021'
      })
    ).not.toBeInViewport();
    await expect(page.getByText('45 (10)').nth(1)).toBeVisible();
    await expect(page.getByText('45 (10)').nth(1)).not.toBeInViewport();
    await expect(
      page
        .getByText(
          'longestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlon'
        )
        .nth(1)
    ).toBeVisible();
    await expect(
      page
        .getByText(
          'longestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlon'
        )
        .nth(1)
    ).not.toBeInViewport();
    await expect(
      page
        .getByText(
          '1--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(1)
    ).toBeVisible();
    await expect(
      page
        .getByText(
          '1--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(1)
    ).not.toBeInViewport();

    // do the right scroll
    await page.getByLabel('flow editor right scroll').click();
    await expect(page.getByLabel('flow editor left scroll')).toBeEnabled();
    await expect(page.getByLabel('flow editor right scroll')).toBeDisabled();

    // we can now see the last term
    await expect(
      page.getByRole('heading', {
        name: 'Fall 2021'
      })
    ).toBeInViewport();
    await expect(page.getByText('45 (10)').nth(1)).toBeInViewport();
    await expect(
      page
        .getByText(
          'longestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlon'
        )
        .nth(1)
    ).toBeInViewport();
    await expect(
      page
        .getByText(
          '1--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(1)
    ).toBeInViewport();

    // but now we cannot see the first term
    await expect(
      page.getByRole('heading', {
        name: 'Summer 2020'
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'Summer 2020'
      })
    ).not.toBeInViewport({
      ratio: testInfo.project.name === 'webkit' ? 0.016 : 0
    });
    await expect(page.getByText('13 (4)').nth(0)).toBeVisible();
    await expect(page.getByText('13 (4)').nth(0)).not.toBeInViewport({
      ratio: testInfo.project.name === 'webkit' ? 0.016 : 0
    });
    await expect(
      page
        .getByText(
          '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(0)
    ).toBeVisible();
    await expect(
      page
        .getByText(
          '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(0)
    ).not.toBeInViewport();

    // do the left scroll
    await page.getByLabel('flow editor left scroll').click();
    await expect(page.getByLabel('flow editor right scroll')).toBeEnabled();
    await expect(page.getByLabel('flow editor left scroll')).toBeDisabled();

    // now we can see the first term again
    await expect(
      page.getByRole('heading', {
        name: 'Summer 2020'
      })
    ).toBeInViewport();
    await expect(page.getByText('13 (4)').nth(0)).toBeInViewport();
    await expect(
      page
        .getByText(
          '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        )
        .nth(0)
    ).toBeInViewport();
  });

  test('selected flowchart loads correctly into editor (some quarters, unit footer resizing)', async ({
    page
  }) => {
    await page.setViewportSize({
      width: 1920,
      height: 720
    });

    await performLoginFrontend(page, userEmail, 'test');
    await expect(page).toHaveURL(/.*flows/);
    expect((await page.textContent('h2'))?.trim()).toBe('Flows');
    expect((await page.context().cookies())[0].name).toBe('sId');

    // make sure test flows exist
    await expect(page.locator(FLOW_LIST_ITEM_SELECTOR)).toHaveText([
      'test flow 0',
      'test flow 1',
      'test flow 2',
      'test flow 3'
    ]);

    // verify correct state when no flowchart selected
    await expect(
      page.getByText('No flow selected. Please select or create a flow.')
    ).toBeInViewport();

    // pick one
    await page.locator(FLOW_LIST_ITEM_SELECTOR).nth(2).click();

    // verify that the editor loaded the selected flowchart properly

    // header
    await expect(
      page.getByRole('heading', {
        name: 'test flow 2'
      })
    ).toBeInViewport();

    // body
    await expect(
      page.getByText(
        'This flow does not have any terms. Add terms by clicking "Actions", then "Add Terms".'
      )
    ).not.toBeVisible();

    // should see full unit counters at this size
    await expect(
      page.getByText('Major: 16', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('Support: 14', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('Concentration #1: 22', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('Concentration #2: 10', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('GE: 20', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('Free Elective: 20', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('Other: 40', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('Total Units: 142', {
        exact: true
      })
    ).toBeInViewport();

    // now resize to something smaller
    await page.setViewportSize({
      width: 1024,
      height: 720
    });

    // we should now have reduced unit counters
    await expect(
      page.getByText('Major: 16', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page.getByText('Support: 14', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page.getByText('Concentration #1: 22', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page.getByText('Concentration #2: 10', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page.getByText('GE: 20', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page.getByText('Free Elective: 20', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page.getByText('Other: 40', {
        exact: true
      })
    ).not.toBeVisible();

    await expect(
      page.getByText('16', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('14', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('22', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('10', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page
        .getByText('20', {
          exact: true
        })
        .nth(0)
    ).toBeInViewport();
    await expect(
      page
        .getByText('20', {
          exact: true
        })
        .nth(1)
    ).toBeInViewport();
    await expect(
      page.getByText('40', {
        exact: true
      })
    ).toBeInViewport();
    await expect(
      page.getByText('Total Units: 142', {
        exact: true
      })
    ).toBeInViewport();

    // now go even smaller
    await page.setViewportSize({
      width: 600,
      height: 720
    });

    await expect(
      page.getByText('16', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page.getByText('14', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page.getByText('22', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page.getByText('10', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page
        .getByText('20', {
          exact: true
        })
        .nth(0)
    ).not.toBeVisible();
    await expect(
      page
        .getByText('20', {
          exact: true
        })
        .nth(1)
    ).not.toBeVisible();
    await expect(
      page.getByText('40', {
        exact: true
      })
    ).not.toBeVisible();
    await expect(
      page.getByText('Total Units: 142', {
        exact: true
      })
    ).toBeInViewport();

    // smallest size
    await page.setViewportSize({
      width: 300,
      height: 720
    });

    await expect(
      page.getByText('Total Units: 142', {
        exact: true
      })
    ).not.toBeVisible();
  });
});
