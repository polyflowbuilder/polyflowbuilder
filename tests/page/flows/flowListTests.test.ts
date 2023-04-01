import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { performLoginFrontend } from '../../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user.js';

const FLOWS_PAGE_FLOW_LIST_TESTS_EMAIL = 'pfb_test_flowsPage_flow_list_playwright@test.com';

async function populateFlowcharts(prisma: PrismaClient, ownerId: string, count: number) {
  for (let i = 0; i < count; i += 1) {
    await prisma.dBFlowchart.create({
      data: {
        hash: '0',
        name: `test flow ${i}`,
        notes: '',
        termData: [],
        unitTotal: '0',
        version: 7,
        ownerId,
        startYear: '2020',
        programId1: '8e195e0c-73ce-44f7-a9ae-0212cd7c4b04'
      }
    });
  }
}

test.describe('flow list tests', () => {
  let userId: string;
  const prisma = new PrismaClient();

  test.beforeAll(async () => {
    // create account
    const id = await createUser({
      email: FLOWS_PAGE_FLOW_LIST_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null when it should not be');
    }
    userId = id;
  });

  test.beforeEach(async ({ page }) => {
    await prisma.dBFlowchart.deleteMany({
      where: {
        ownerId: userId
      }
    });

    await performLoginFrontend(page, FLOWS_PAGE_FLOW_LIST_TESTS_EMAIL, 'test');
  });

  test.afterAll(async () => {
    await deleteUser(FLOWS_PAGE_FLOW_LIST_TESTS_EMAIL);
  });

  test('ui for empty flows list correct', async ({ page }) => {
    await expect(page.getByText('You do not have any flows. Start by creating one!')).toBeVisible();
    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).toBeInViewport();
    // selector for a flowlistitem
    await expect(
      page.locator('.card > .card-body.text-center > .text-base.select-none.break-words')
    ).toHaveCount(0);
  });

  test('ui for single flowchart in flow list correct', async ({ page }) => {
    // populate with a single flowchart
    await populateFlowcharts(prisma, userId, 1);
    await page.reload();

    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).not.toBeVisible();
    // selector for a flowlistitem
    await expect(
      page.locator('.card > .card-body.text-center > .text-base.select-none.break-words')
    ).toHaveCount(1);

    await expect(page.getByText('test flow 0')).toBeVisible();
    await expect(page.getByText('test flow 0')).toBeInViewport();
  });

  test('ui for multiple flows in flow list correct (no overflow)', async ({ page }) => {
    // populate with more flowcharts
    await populateFlowcharts(prisma, userId, 3);
    await page.reload();

    await expect(
      page.getByText('You do not have any flows. Start by creating one!')
    ).not.toBeVisible();
    // selector for a flowlistitem
    await expect(
      page.locator('.card > .card-body.text-center > .text-base.select-none.break-words')
    ).toHaveCount(3);

    await expect(page.getByText('test flow 0')).toBeVisible();
    await expect(page.getByText('test flow 0')).toBeInViewport();
    await expect(page.getByText('test flow 1')).toBeVisible();
    await expect(page.getByText('test flow 1')).toBeInViewport();
    await expect(page.getByText('test flow 2')).toBeVisible();
    await expect(page.getByText('test flow 2')).toBeInViewport();
  });

  // TODO: wait for POLY-510, currently failing
  // test('ui for multiple flows in flow list correct (overflow)', async ({ page }) => {
  //   // populate with more flowcharts
  //   await populateFlowcharts(prisma, userId, 10);
  //   await page.reload();

  //   await expect(
  //     page.getByText('You do not have any flows. Start by creating one!')
  //   ).not.toBeVisible();
  //   // selector for a flowlistitem
  //   await expect(
  //     page.locator('.card > .card-body.text-center > .text-base.select-none.break-words')
  //   ).toHaveCount(10);

  //   await expect(page.getByText('test flow 0')).toBeVisible();
  //   await expect(page.getByText('test flow 0')).toBeInViewport();
  //   await expect(page.getByText('test flow 1')).toBeVisible();
  //   await expect(page.getByText('test flow 1')).toBeInViewport();
  //   await expect(page.getByText('test flow 2')).toBeVisible();
  //   await expect(page.getByText('test flow 2')).toBeInViewport();
  //   await expect(page.getByText('test flow 3')).toBeVisible();
  //   await expect(page.getByText('test flow 3')).toBeInViewport();
  //   await expect(page.getByText('test flow 4')).toBeVisible();
  //   await expect(page.getByText('test flow 4')).toBeInViewport();
  //   await expect(page.getByText('test flow 5')).toBeVisible();
  //   await expect(page.getByText('test flow 5')).toBeInViewport();
  //   await expect(page.getByText('test flow 6')).toBeVisible();
  //   await expect(page.getByText('test flow 6')).toBeInViewport();
  //   await expect(page.getByText('test flow 7')).toBeVisible();
  //   await expect(page.getByText('test flow 7')).toBeInViewport();
  //   await expect(page.getByText('test flow 8')).toBeVisible();
  //   await expect(page.getByText('test flow 8')).toBeInViewport();
  //   await expect(page.getByText('test flow 9')).toBeVisible();
  //   await expect(page.getByText('test flow 9')).toBeInViewport();
  // });

  // TODO: wait for POLY-510
  // test('reordering flows in flow list correct', async () => {});
});
