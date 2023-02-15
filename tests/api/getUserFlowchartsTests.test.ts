// NOTE: need .js extension for PlayWright
import { createUserAccount, deleteUserAccount } from '../util/userTestUtil.js';

import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const GET_USER_FLOWCHARTS_TESTS_API_EMAIL = 'pfb_test_getUserFlowchartssAPI_playwright@test.com';

test.describe('getUserFlowcharts API tests', () => {
  const prisma = new PrismaClient();

  test.beforeAll(async () => {
    // create account
    await createUserAccount(GET_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test', 'test');
  });

  test.afterAll(async () => {
    // delete account
    await deleteUserAccount(GET_USER_FLOWCHARTS_TESTS_API_EMAIL);
  });

  test('fetch results in 400 without authentication', async ({ request }) => {
    const res = await request.get('http://localhost:4173/api/user/data/getUserFlowcharts');

    const expectedResponseBody = {
      message: 'Request was unauthenticated. Please authenticate and try again.'
    };

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('authenticated request succeeds with 200 empty flowcharts list', async ({ request }) => {
    // perform login
    await request.post('http://localhost:4173/api/auth/login', {
      data: {
        email: GET_USER_FLOWCHARTS_TESTS_API_EMAIL,
        password: 'test'
      }
    });

    // test with empty flowcharts
    const res = await request.get('http://localhost:4173/api/user/data/getUserFlowcharts');

    const expectedResponseBody = {
      message: 'User flowchart retrieval successful.',
      flowcharts: []
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('authenticated request succeeds with 200 nonempty flowcharts list', async ({ request }) => {
    // create flowcharts
    const { id } = await prisma.user.findFirst({
      where: {
        email: GET_USER_FLOWCHARTS_TESTS_API_EMAIL
      },
      select: {
        id: true
      }
    });

    await prisma.flowchart.createMany({
      data: [
        {
          hash: '1',
          name: 'test1',
          notes: '',
          ownerId: id,
          programId1: '0017f92d-d73f-4819-9d59-8c658cd29be5',
          startYear: '2020',
          termData: {},
          unitTotal: '0',
          version: 6
        },
        {
          hash: '2',
          name: 'test2',
          notes: '',
          ownerId: id,
          programId1: '002e8710-245f-46a4-8689-2ab2f5a47170',
          startYear: '2022',
          termData: {},
          unitTotal: '1',
          version: 6
        }
      ]
    });

    // perform login
    await request.post('http://localhost:4173/api/auth/login', {
      data: {
        email: GET_USER_FLOWCHARTS_TESTS_API_EMAIL,
        password: 'test'
      }
    });

    // test with empty flowcharts
    const res = await request.get('http://localhost:4173/api/user/data/getUserFlowcharts');

    const expectedFlowcharts = await prisma.flowchart
      .findMany({
        where: {
          ownerId: id
        }
      })
      // need to serialize date object bc thats what we receive from API
      .then((fArr) =>
        fArr.map((f) => {
          return {
            ...f,
            lastUpdatedUTC: f.lastUpdatedUTC.toISOString()
          };
        })
      );
    const expectedResponseBody = {
      message: 'User flowchart retrieval successful.',
      flowcharts: expectedFlowcharts
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(expectedResponseBody);
  });

  // TODO: 500 case tests
});

// TODO: ADD TESTS TO CHECK IF FLOWCHART DATA IS FETCHED ON LOGIN
