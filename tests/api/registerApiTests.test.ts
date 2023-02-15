// NOTE: need .js extension for PlayWright
import { deleteUserAccount } from '../util/userTestUtil.js';

import { expect, test } from '@playwright/test';

const REGISTER_API_TESTS_EMAIL = 'pfb_test_registerAPI_playwright@test.com';

test.describe('register api tests', () => {
  test.afterAll(async () => {
    // delete account
    await deleteUserAccount(REGISTER_API_TESTS_EMAIL);
  });

  test('empty payload results in 400', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/register', {
      data: {}
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        username: ['Username is required.'],
        email: ['Email address is required.'],
        password: ['Password is required.'],
        passwordConfirm: ['Password confirmation is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('missing username results in 400', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/register', {
      data: {
        email: 'test@test.com',
        password: 'test',
        passwordConfirm: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        username: ['Username is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('missing email results in 400', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/register', {
      data: {
        username: 'test',
        password: 'test',
        passwordConfirm: 'test'
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
    const res = await request.post('http://localhost:4173/api/auth/register', {
      data: {
        username: 'test',
        email: 'test@test.com',
        passwordConfirm: 'test'
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

  test('missing passwordConfirm results in 400', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/register', {
      data: {
        username: 'test',
        email: 'test@test.com',
        password: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        passwordConfirm: ['Password confirmation is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('correct payload results in 201', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/register', {
      data: {
        username: 'test',
        email: REGISTER_API_TESTS_EMAIL,
        password: 'test',
        passwordConfirm: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Account successfully created.'
    };

    expect(res.status()).toBe(201);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('existing email results in 400', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/register', {
      data: {
        username: 'test',
        email: REGISTER_API_TESTS_EMAIL,
        password: 'test',
        passwordConfirm: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'An account with this email already exists.'
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('send garbage request results in 500', async ({ request }) => {
    // honestly not sure why this triggers 500 but will roll with it
    const res = await request.post('http://localhost:4173/api/auth/register', {});

    const expectedResponseBody = {
      message: 'An error occurred while creating the new account, please try again later.'
    };

    expect(res.status()).toBe(500);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
});
