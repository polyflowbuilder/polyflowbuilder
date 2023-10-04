import { PrismaClient } from '@prisma/client';
import { expect, test } from '@playwright/test';
import { createUser, deleteUser } from '$lib/server/db/user';
import { UserDataUpdateChunkType } from '$lib/types/mutateUserDataTypes';
import { CURRENT_FLOW_DATA_VERSION } from '$lib/common/config/flowDataConfig';
import { getUserEmailString, performLoginBackend } from 'tests/util/userTestUtil';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';

test.describe('update user flowchart api tests', () => {
  const prisma = new PrismaClient();
  let flowId: string;
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_updateUserFlowchartsAPI_playwright@test.com',
      testInfo
    );
    const id = await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('id is null');
    }

    // create dummy flowcharts to tinker with
    flowId = (
      await prisma.dBFlowchart.create({
        data: {
          hash: '1',
          name: 'test1',
          notes: '',
          ownerId: id,
          programId1: '0017f92d-d73f-4819-9d59-8c658cd29be5',
          startYear: '2020',
          termData: [],
          unitTotal: '0',
          version: CURRENT_FLOW_DATA_VERSION,
          pos: 0
        },
        select: {
          id: true,
          lastUpdatedUTC: true
        }
      })
    ).id;
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(userEmail);
  });

  test('request returns 401 without authorization', async ({ request }) => {
    const res = await request.post('/api/user/data/updateUserFlowcharts');

    const expectedResponseBody = {
      message: 'Request was unauthenticated. Please authenticate and try again.'
    };

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('missing payload update chunks array returns 400', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {}
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Flowchart update chunks array required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('incorrect data type for payload update chunks array returns 400', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Received incorrect type for flowchart update chunks array.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('empty payload update chunks array returns 400', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: []
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Flowchart update chunks array must contain at least one update chunk.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('improper update chunk format in update chunks array returns 400', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: ['test']
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Expected object, received string']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('invalid update chunk data in update chunks array returns 400', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const updateChunk: UserDataUpdateChunk = {
      type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
      data: {
        order: [
          {
            id: '9f96fd34-c25f-4b0c-af5e-a6478bbbfea6',
            pos: 2
          }
        ]
      }
    };

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [updateChunk]
      }
    });

    const expectedResponseBody = {
      message: 'Requested user flowchart updates are not valid for these data.'
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('proper update chunk in update chunks array returns 200', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const updateChunk: UserDataUpdateChunk = {
      type: UserDataUpdateChunkType.FLOW_LIST_CHANGE,
      data: {
        order: [
          {
            id: flowId,
            pos: 2
          }
        ]
      }
    };

    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [updateChunk]
      }
    });

    const expectedResponseBody = {
      message: 'User flowchart data changes successfully persisted.'
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('send garbage request results in 500', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {});

    const expectedResponseBody = {
      message: 'An error occurred while updating user flowcharts, please try again a bit later.'
    };

    expect(res.status()).toBe(500);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
});
