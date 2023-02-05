import { expect, test } from '@playwright/test';

test.describe('forgot password api tests', () => {
  test('submit password reset returns 400 without email', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/forgotpassword', {
      data: {}
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

  test('submit password reset returns 400 with invalid email', async ({ request }) => {
    // type 1 invalid
    let res = await request.post('http://localhost:4173/api/auth/forgotpassword', {
      data: {
        email: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        email: ['Email must be a valid email address.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);

    // type 2 invalid
    res = await request.post('http://localhost:4173/api/auth/forgotpassword', {
      data: {
        email: 'test@test'
      }
    });

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('submit password reset returns 201 with good payload', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/forgotpassword', {
      data: {
        email: 'test@test.com'
      }
    });

    const expectedResponseBody = {
      message: 'Reset password request successfully initiated.'
    };

    expect(res.status()).toBe(201);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('send garbage request results in 500', async ({ request }) => {
    const res = await request.post('http://localhost:4173/api/auth/forgotpassword', {});

    const expectedResponseBody = {
      message:
        'An error occurred while initiating reset password request, please try again a bit later.'
    };

    expect(res.status()).toBe(500);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
});
