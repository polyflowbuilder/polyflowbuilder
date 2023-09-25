import { PrismaClient } from '@prisma/client';
import { expect, test } from '@playwright/test';
import { getUserFlowcharts } from '$lib/server/db/flowchart';
import { populateFlowcharts } from 'tests/util/userDataTestUtil.js';
import { performLoginBackend } from 'tests/util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { UserDataUpdateChunkType } from '$lib/types/mutateUserDataTypes';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types/apiDataTypes.js';
import type { MutateFlowchartData } from '$lib/types/mutateUserDataTypes';

const FLOW_LIST_CHANGE_TESTS_API_EMAIL =
  'pfb_test_updateUserFlowchartsAPI_FLOW_LIST_CHANGE_playwright@test.com';

const FLOW_LIST_CHANGE_TESTS_API_OTHER_USER_EMAIL =
  'pfb_test_updateUserFlowchartsAPI_FLOW_LIST_CHANGE_other_playwright@test.com';

// see API route for expected return type
interface GetUserFlowchartsExpectedReturnType {
  message: string;
  flowcharts: Flowchart[];
  courseCache: CourseCache[] | undefined;
}

test.describe('FLOW_LIST_CHANGE payload tests for updateUserFlowcharts API', () => {
  const prisma = new PrismaClient();
  const flowsMain: MutateFlowchartData[] = [];
  let flowIdOther: string;

  test.beforeAll(async () => {
    // create accounts
    const userIdMain = await createUser({
      email: FLOW_LIST_CHANGE_TESTS_API_EMAIL,
      username: 'test',
      password: 'test'
    });

    const userIdOther = await createUser({
      email: FLOW_LIST_CHANGE_TESTS_API_OTHER_USER_EMAIL,
      username: 'test',
      password: 'test'
    });

    if (!userIdMain || !userIdOther) {
      throw new Error('userId is null');
    }

    // create flows for main account
    await populateFlowcharts(prisma, userIdMain, 3);
    flowsMain.push(...(await getUserFlowcharts(userIdMain)));

    // create flows for other account
    flowIdOther = (await populateFlowcharts(prisma, userIdOther, 1))[0];

    // need to wait here bc we only track lastUpdatedUTC w/ second precision,
    // so if flows are created and updated in less than 1 second, lastUpdatedUTC
    // won't change and the test that tests this will FAIL!
    await new Promise((r) => setTimeout(r, 1000));
  });

  test.afterAll(async () => {
    // delete accounts
    await deleteUser(FLOW_LIST_CHANGE_TESTS_API_EMAIL);
    await deleteUser(FLOW_LIST_CHANGE_TESTS_API_OTHER_USER_EMAIL);
  });

  test('improperly formatted update chunk returns 400 (#1)', async ({ request }) => {
    await performLoginBackend(request, FLOW_LIST_CHANGE_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_LIST_CHANGE
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Data field for update chunk required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('improperly formatted update chunk returns 400 (#2)', async ({ request }) => {
    await performLoginBackend(request, FLOW_LIST_CHANGE_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
            data: {}
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Order field for update chunk required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('improperly formatted update chunk returns 400 (#3)', async ({ request }) => {
    await performLoginBackend(request, FLOW_LIST_CHANGE_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
            data: {
              order: []
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Order array must not be empty.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('improperly formatted update chunk returns 400 (#4)', async ({ request }) => {
    await performLoginBackend(request, FLOW_LIST_CHANGE_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
            data: {
              order: [{}]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['ID for order entry is required.', 'Position field is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('improperly formatted update chunk returns 400 (#5)', async ({ request }) => {
    await performLoginBackend(request, FLOW_LIST_CHANGE_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
            data: {
              order: [
                {
                  id: 'test',
                  pos: -1
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['ID for order entry must be a UUID.', 'Position field must not be negative.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('update chunk that references nonexistent flowchart returns 400', async ({ request }) => {
    await performLoginBackend(request, FLOW_LIST_CHANGE_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
            data: {
              order: [
                {
                  id: '2285de18-a8e0-452d-9b05-a9f6d53caf39',
                  pos: 1
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Requested user flowchart updates are not valid for these data.'
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('update chunk that references flowchart not owned by authenticated user returns 400', async ({
    request
  }) => {
    await performLoginBackend(request, FLOW_LIST_CHANGE_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
            data: {
              order: [
                {
                  id: flowIdOther,
                  pos: 1
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Requested user flowchart updates are not valid for these data.'
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('valid FLOW_LIST_CHANGE update chunk returns 200', async ({ request }) => {
    await performLoginBackend(request, FLOW_LIST_CHANGE_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
            data: {
              order: [
                {
                  id: flowsMain[0].flowchart.id,
                  pos: 2
                },
                {
                  id: flowsMain[1].flowchart.id,
                  pos: 1
                },
                {
                  id: flowsMain[2].flowchart.id,
                  pos: 0
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'User flowchart data changes successfully persisted.'
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);

    // now ensure that this change persisted correctly
    const persistRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(persistRes.status()).toBe(200);

    const persistResJSON = (await persistRes.json()) as GetUserFlowchartsExpectedReturnType;
    const flowcharts: Flowchart[] = persistResJSON.flowcharts;

    expect(persistResJSON.message).toEqual('User flowchart retrieval successful.');

    const { lastUpdatedUTC: flow0LastUpdated, ...flow0 } = flowcharts[0];
    const { lastUpdatedUTC: flow1LastUpdated, ...flow1 } = flowcharts[1];
    const { lastUpdatedUTC: flow2LastUpdated, ...flow2 } = flowcharts[2];

    const { lastUpdatedUTC: flow0MainLastUpdated, ...flow0Main } = flowsMain[0].flowchart;
    const { lastUpdatedUTC: flow1MainLastUpdated, ...flow1Main } = flowsMain[1].flowchart;
    const { lastUpdatedUTC: flow2MainLastUpdated, ...flow2Main } = flowsMain[2].flowchart;

    expect(flow0).toStrictEqual(flow2Main);
    expect(flow0LastUpdated).not.toEqual(flow2MainLastUpdated.toISOString());

    expect(flow1).toStrictEqual(flow1Main);
    expect(flow1LastUpdated).not.toEqual(flow1MainLastUpdated.toISOString());

    expect(flow2).toStrictEqual(flow0Main);
    expect(flow2LastUpdated).not.toEqual(flow0MainLastUpdated.toISOString());
  });
});
