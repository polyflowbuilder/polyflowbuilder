// NOTE: need ignores bc we need the .ts extension for Playwright
// see https://playwright.dev/docs/test-typescript#typescript-with-esm

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { createUserAccount, deleteUserAccount } from '../util/userTestUtil.ts';

import { expect, test } from '@playwright/test';

const LOGIN_API_TESTS_EMAIL = 'pfb_test_loginAPI_playwright@test.com';

test.describe('login api tests', () => {
  test.beforeAll(async () => {
    // create account
    await createUserAccount(LOGIN_API_TESTS_EMAIL, 'test', 'test');
  });

  test.afterAll(async () => {
    // delete account
    await deleteUserAccount(LOGIN_API_TESTS_EMAIL);
  });

  test('empty payload results in 400', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/login', {
      data: {}
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        email: ['Email address is required.'],
        password: ['Password is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('missing email results in 400', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/login', {
      data: {
        password: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        email: ['Email address is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('missing password results in 400', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/login', {
      data: {
        email: 'test@test.com'
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        password: ['Password is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('authentication fails in 401', async ({ request }) => {
    // bad email
    let res = await request.post('http://localhost:4173/api/auth/login', {
      data: {
        email: 'incorrect@gmail.com',
        password: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Incorrect email address or password.'
    };

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);

    // bad password
    res = await request.post('http://localhost:4173/api/auth/login', {
      data: {
        email: LOGIN_API_TESTS_EMAIL,
        password: 'incorrect'
      }
    });

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('authentication successful with 303 response', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/login', {
      data: {
        email: LOGIN_API_TESTS_EMAIL,
        password: 'test'
      },
      maxRedirects: 0 // so we get the JSON 303 instead of the HTML 200
    });

    const expectedResponseBody = {
      message: 'User authentication successful.'
    };

    expect(res.status()).toBe(303);
    expect(await res.json()).toStrictEqual(expectedResponseBody);

    // make sure correct headers are present
    expect(res.headers()['location']).toBe('/flows');
    expect(res.headers()['set-cookie']).toBeTruthy();
  });

  test('send garbage request results in 500', async ({ request }) => {
    // honestly not sure why this triggers 500 but will roll with it
    const res = await request.post('http://localhost:4173/api/auth/login', {});

    const expectedResponseBody = {
      message: 'An error occurred while authenticating user, please try again later.'
    };

    expect(res.status()).toBe(500);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
});
