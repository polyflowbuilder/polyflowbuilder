import { expect, test } from '@playwright/test';
import { performLoginBackend } from '../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { UserDataUpdateChunkType } from '$lib/common/schema/mutateUserDataSchema';
import type { UserDataUpdateChunk } from '$lib/common/schema/mutateUserDataSchema';

const UPDATE_USER_FLOWCHARTS_TESTS_API_EMAIL =
  'pfb_test_updateUserFlowchartsAPI_playwright@test.com';

test.describe('update user flowchart api tests', () => {
  test.beforeAll(async () => {
    // create account
    await createUser({
      email: UPDATE_USER_FLOWCHARTS_TESTS_API_EMAIL,
      username: 'test',
      password: 'test'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(UPDATE_USER_FLOWCHARTS_TESTS_API_EMAIL);
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
    await performLoginBackend(request, UPDATE_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test');

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
    await performLoginBackend(request, UPDATE_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test');

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
    await performLoginBackend(request, UPDATE_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test');

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

  test('improper update chunk in update chunks array returns 400', async ({ request }) => {
    await performLoginBackend(request, UPDATE_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test');

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

  test('proper update chunk in update chunks array returns 200', async ({ request }) => {
    await performLoginBackend(request, UPDATE_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test');

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
      message: 'User flowchart data changes successfully persisted.'
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('send garbage request results in 500', async ({ request }) => {
    await performLoginBackend(request, UPDATE_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test');

    const res = await request.post('/api/user/data/updateUserFlowcharts', {});

    const expectedResponseBody = {
      message: 'An error occurred while updating user flowcharts, please try again a bit later.'
    };

    expect(res.status()).toBe(500);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
});
