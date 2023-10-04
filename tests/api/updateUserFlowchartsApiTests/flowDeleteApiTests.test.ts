import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { populateFlowcharts } from 'tests/util/userDataTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { UserDataUpdateChunkType } from '$lib/types/mutateUserDataTypes.js';
import { getUserEmailString, performLoginBackend } from 'tests/util/userTestUtil.js';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types/apiDataTypes.js';

// see API route for expected return type
interface GetUserFlowchartsExpectedReturnType {
  message: string;
  flowcharts: Flowchart[];
  courseCache: CourseCache[] | undefined;
}

test.describe('FLOW_DELETE payload tests for updateUserFlowcharts API', () => {
  const prisma = new PrismaClient();
  let userId: string;
  let flowId: string;
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_updateUserFlowchartsAPI_FLOW_DELETE_playwright@test.com',
      testInfo
    );
    const id = await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null');
    }

    userId = id;

    // create existing flow to test with
    flowId = (await populateFlowcharts(prisma, userId, 1))[0];
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(userEmail);
  });

  test('improperly formatted delete chunk returns 400 (#1)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_DELETE
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

  test('improperly formatted delete chunk returns 400 (#2)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_DELETE,
            data: {}
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['ID field for FLOW_DELETE update chunk required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('improperly formatted delete chunk returns 400 (#3)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_DELETE,
            data: {
              id: 'hi'
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['ID field for FLOW_DELETE update chunk must be a UUID.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('valid FLOW_DELETE update chunk returns 200 (deleted)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    // perform GET and expect flowchart to exist
    const initFlowRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(initFlowRes.status()).toBe(200);
    const initFlowsResJSON = (await initFlowRes.json()) as GetUserFlowchartsExpectedReturnType;
    const initFlowcharts: Flowchart[] = initFlowsResJSON.flowcharts;
    expect(initFlowsResJSON.message).toEqual('User flowchart retrieval successful.');
    expect(initFlowcharts.length).toBe(1);
    expect(initFlowcharts[0].id).toBe(flowId);

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_DELETE,
            data: {
              id: flowId
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

    // now check to verify that the flowchart is deleted
    const afterDeleteFlowRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(afterDeleteFlowRes.status()).toBe(200);
    const afterDeleteFlowsResJSON =
      (await afterDeleteFlowRes.json()) as GetUserFlowchartsExpectedReturnType;
    const afterDeleteFlowcharts: Flowchart[] = afterDeleteFlowsResJSON.flowcharts;
    expect(afterDeleteFlowsResJSON.message).toEqual('User flowchart retrieval successful.');
    expect(afterDeleteFlowcharts.length).toBe(0);
  });
});
