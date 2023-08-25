import { expect, test } from '@playwright/test';
import { performLoginBackend } from 'tests/util/userTestUtil';
import { createUser, deleteUser } from '$lib/server/db/user';

const GET_AVAILABLE_CATALOGS_API_TESTS_EMAIL =
  'pfb_test_getAvailableCatalogsAPI_playwright@test.com';

test.describe('getAvailableStartYears tests', () => {
  test.beforeAll(async () => {
    // create account
    await createUser({
      email: GET_AVAILABLE_CATALOGS_API_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(GET_AVAILABLE_CATALOGS_API_TESTS_EMAIL);
  });

  test('authenticated request is successful', async ({ request }) => {
    await performLoginBackend(request, GET_AVAILABLE_CATALOGS_API_TESTS_EMAIL, 'test');

    const res = await request.get('/api/data/getAvailableCatalogs');
    const resData = (await res.json()) as {
      catalogs: string[];
    };

    expect(res.status()).toBe(200);
    expect(resData).toHaveProperty('catalogs');
    expect(resData.catalogs.length).toBeTruthy();
  });

  test('401 case handled properly', async ({ request }) => {
    const res = await request.get('/api/data/getAvailableCatalogs');
    const resData = (await res.json()) as unknown;

    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(401);
    expect(resData).toStrictEqual({
      message: 'Request must be authenticated.'
    });
  });

  // TODO: add 500 case
});
