import { v4 as uuid } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { expect, test } from '@playwright/test';
import { populateFlowcharts } from '../../util/userDataTestUtil.js';
import { performLoginBackend } from '../../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { UserDataUpdateChunkType } from '$lib/types/mutateUserDataTypes.js';
import type { Flowchart } from '$lib/common/schema/flowchartSchema.js';

const FLOW_UPSERT_ALL_TESTS_API_EMAIL =
  'pfb_test_updateUserFlowchartsAPI_FLOW_UPSERT_ALL_playwright@test.com';

test.describe('FLOW_UPSERT_ALL payload tests for updateUserFlowcharts API', () => {
  const prisma = new PrismaClient();
  let userId: string;

  test.beforeAll(async () => {
    // create account
    const id = await createUser({
      email: FLOW_UPSERT_ALL_TESTS_API_EMAIL,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null');
    }

    userId = id;

    // create existing flow to test with
    await populateFlowcharts(prisma, userId, 1);
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(FLOW_UPSERT_ALL_TESTS_API_EMAIL);
  });

  test('improperly formatted upsert chunk returns 400 (#1)', async ({ request }) => {
    await performLoginBackend(request, FLOW_UPSERT_ALL_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_UPSERT_ALL
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

  test('improperly formatted upsert chunk returns 400 (#2)', async ({ request }) => {
    await performLoginBackend(request, FLOW_UPSERT_ALL_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_UPSERT_ALL,
            data: {}
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Flowchart data is required.', 'Position field is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('improperly formatted upsert chunk returns 400 (#3)', async ({ request }) => {
    await performLoginBackend(request, FLOW_UPSERT_ALL_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_UPSERT_ALL,
            data: {
              flowchart: {},
              pos: -1
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: [
          'Flowchart unique ID is required.',
          'Owner unique ID is required.',
          'Flowchart name is required.',
          'Flowchart program ID is required.',
          'Flowchart start year is required.',
          'Unit count is required.',
          'Flowchart notes field is required.',
          'Array for terms in flowchart is required.',
          'Flowchart version is required.',
          'Hash is required.',
          'Flowchart published ID field is required.',
          'Flowchart imported ID field is required.',
          'Flowchart last updated UTC time is required.',
          'Position field must not be negative.'
        ]
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('valid FLOW_UPSERT_ALL update chunk returns 200 (create)', async ({ request }) => {
    await performLoginBackend(request, FLOW_UPSERT_ALL_TESTS_API_EMAIL, 'test');

    // bc other test may run first and modify data
    const initFlowsRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(initFlowsRes.status()).toBe(200);
    const initFlowsResJSON = await initFlowsRes.json();
    const initFlowcharts: Flowchart[] = initFlowsResJSON.flowcharts;
    expect(initFlowsResJSON.message as string).toEqual('User flowchart retrieval successful.');

    const flowchart: Flowchart = {
      id: uuid(),
      ownerId: userId,
      name: 'new test',
      programId: ['8e195e0c-73ce-44f7-a9ae-0212cd7c4b04'],
      startYear: '2020',
      unitTotal: '0',
      notes: '',
      termData: [
        {
          tIndex: -1,
          courses: [],
          tUnits: '0'
        }
      ],
      version: 7,
      hash: '0cc175b9c0f1b6a831c399e269772661.0cc175b9c0f1b6a831c399e269772661',
      publishedId: null,
      importedId: null,
      // only have second-level precision in db
      lastUpdatedUTC: new Date(new Date().setMilliseconds(0))
    };

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_UPSERT_ALL,
            data: {
              flowchart,
              pos: 1
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

    // ensure this change persisted correctly
    const persistRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(persistRes.status()).toBe(200);

    const persistResJSON = await persistRes.json();
    const flowcharts: Flowchart[] = persistResJSON.flowcharts;

    expect(persistResJSON.message as string).toEqual('User flowchart retrieval successful.');

    expect(flowcharts[0]).toStrictEqual(initFlowcharts[0]);
    expect(flowcharts[1]).toStrictEqual({
      ...flowchart,
      lastUpdatedUTC: flowchart.lastUpdatedUTC.toISOString()
    });
  });

  test('valid FLOW_UPSERT_ALL update chunk returns 200 (update)', async ({ request }) => {
    await performLoginBackend(request, FLOW_UPSERT_ALL_TESTS_API_EMAIL, 'test');

    const initFlowsRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(initFlowsRes.status()).toBe(200);
    const initFlowsResJSON = await initFlowsRes.json();
    const initFlowcharts: Flowchart[] = initFlowsResJSON.flowcharts;
    expect(initFlowsResJSON.message as string).toEqual('User flowchart retrieval successful.');

    // submit update to change existing flow
    // this flow should be at idx 0
    const fieldsToChange = {
      name: 'new flow name',
      unitTotal: '100',
      startYear: '2023',
      programId: ['554c4977-b843-4640-b314-3c01cbad7cdb'],
      notes: 'these are some new notes!'
    };

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_UPSERT_ALL,
            data: {
              flowchart: {
                ...initFlowcharts[0],
                ...fieldsToChange
              },
              pos: 0
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

    // ensure this change persisted correctly
    const persistRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(persistRes.status()).toBe(200);

    const persistResJSON = await persistRes.json();
    const flowcharts: Flowchart[] = persistResJSON.flowcharts;

    expect(persistResJSON.message as string).toEqual('User flowchart retrieval successful.');

    // original flowchart should be at idx 0
    expect(flowcharts[0]).toStrictEqual({
      ...initFlowcharts[0],
      ...fieldsToChange
    });
    expect(flowcharts[1]).toStrictEqual(initFlowcharts[1]);
  });
});
