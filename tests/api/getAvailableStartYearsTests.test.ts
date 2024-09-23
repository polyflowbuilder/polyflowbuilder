import { expect, test } from '@playwright/test';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginBackend } from '../util/userTestUtil';

test.describe('getAvailableStartYears tests', () => {
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_getAvailableStartYearsAPI_playwright@test.com',
      testInfo
    );
    await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(userEmail);
  });

  test('authenticated request is successful', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get('/api/data/getAvailableStartYears');
    const resData = (await res.json()) as {
      startYears: string[];
    };

    expect(res.status()).toBe(200);
    expect(resData).toHaveProperty('startYears');
    expect(resData.startYears.length).toBeTruthy();

    // expect entries to be sorted (deterministic order)
    expect(resData.startYears).toStrictEqual(
      [...resData.startYears].sort((a, b) => a.localeCompare(b))
    );
  });

  test('401 case handled properly', async ({ request }) => {
    const res = await request.get('/api/data/getAvailableStartYears');
    const resData = (await res.json()) as unknown;

    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(401);
    expect(resData).toStrictEqual({
      message: 'Request must be authenticated.'
    });
  });

  // TODO: add 500 case
});
