// testing utilities related to user manipulation

import { expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import type { Page, TestInfo } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

const prisma = new PrismaClient();

export function getUserEmailString(email: string, testInfo: TestInfo) {
  return `${testInfo.project.name}_${email}`;
}

export async function performLoginFrontend(page: Page, email: string, password: string) {
  await page.goto('/login', {
    waitUntil: 'networkidle'
  });
  await expect(page).toHaveURL(/.*login/);
  expect((await page.textContent('h2'))?.trim()).toBe('Sign In');
  await expect(page.locator('button')).toBeVisible();

  // get previous lastlogindate
  const prevLastLoginTimeUTC = await prisma.user.findFirst({
    where: {
      email
    },
    select: {
      lastLoginTimeUTC: true
    }
  });
  // do it this way so we can extract date with type safety
  if (!prevLastLoginTimeUTC) {
    throw new Error('prevlastlogintimeutc null');
  }

  // wait at least 1 second before attempting login to make sure
  // we don't get false positives with checking lastLoginTimeUTC diff
  // (times are stored with second precision)
  await page.waitForTimeout(1000);

  await page.getByLabel('email').fill(email);
  await page.getByLabel('password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // await for login process to finish redirecting
  await expect(page).not.toHaveURL(/.*login/);

  // make sure that lastlogindate was updated
  const lastLoginTimeUTC = await prisma.user.findFirst({
    where: {
      email
    },
    select: {
      lastLoginTimeUTC: true
    }
  });
  if (!lastLoginTimeUTC) {
    throw new Error('lastlogintimeutc null');
  }

  // not checking timestamps bc dont know what it should be
  expect(lastLoginTimeUTC.lastLoginTimeUTC).not.toEqual(prevLastLoginTimeUTC.lastLoginTimeUTC);
}

export async function performLoginBackend(
  request: APIRequestContext,
  email: string,
  password: string
) {
  // perform login
  await request.post('/api/auth/login', {
    data: {
      email,
      password
    }
  });
}
