import { createToken } from 'tests/util/tokenTestUtil.js';
import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { getUserEmailString } from 'tests/util/userTestUtil';
import { createUser, deleteUser } from '$lib/server/db/user';

test.describe('reset password api tests', () => {
  test('perform password reset returns 400 without email', async ({ request }) => {
    const res = await request.post('/api/auth/resetpassword', {
      data: {
        resetToken: 'test',
        password: 'test',
        passwordConfirm: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        resetEmail: ['Email address is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('perform password reset returns 400 without token', async ({ request }) => {
    const res = await request.post('/api/auth/resetpassword', {
      data: {
        resetEmail: 'test@test.com',
        password: 'test',
        passwordConfirm: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        resetToken: ['Token is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('perform password reset returns 400 without password', async ({ request }) => {
    const res = await request.post('/api/auth/resetpassword', {
      data: {
        resetEmail: 'test@test.com',
        resetToken: 'test',
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

  test('perform password reset returns 400 without passwordConfirm', async ({ request }) => {
    const res = await request.post('/api/auth/resetpassword', {
      data: {
        resetEmail: 'test@test.com',
        resetToken: 'test',
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

  test('perform password reset returns 401 with invalid token', async ({ request }) => {
    const res = await request.post('/api/auth/resetpassword', {
      data: {
        resetEmail: 'test@test.com',
        resetToken: 'test',
        password: 'test',
        passwordConfirm: 'test'
      }
    });

    const expectedResponseBody = {
      message:
        'Password reset token is no longer valid. Please try the password reset process again.'
    };

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('perform password reset returns 200 with valid payload', async ({ request }, testInfo) => {
    // create account
    const userEmail = getUserEmailString('pfb_test_resetPasswordAPI_playwright@test.com', testInfo);
    await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });
    // create token
    const prisma = new PrismaClient();
    await createToken(prisma, userEmail, 'PASSWORD_RESET');

    const res = await request.post('/api/auth/resetpassword', {
      data: {
        resetEmail: userEmail,
        resetToken: 'testtoken',
        password: 'test',
        passwordConfirm: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Password reset successful.'
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);

    // delete account
    await deleteUser(userEmail);
  });

  test('send garbage request results in 500', async ({ request }) => {
    const res = await request.post('/api/auth/resetpassword', {});

    const expectedResponseBody = {
      message: 'An error occurred while performing password reset, please try again a bit later.'
    };

    expect(res.status()).toBe(500);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
});
