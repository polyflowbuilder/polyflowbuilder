// testing utilities related to user manipulation

import argon2 from 'argon2';
import { expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import type { Page } from '@playwright/test';

const prisma = new PrismaClient();

// TODO: figure out how we can import from db/user without
// playwright complaining about
export async function createUserAccount(email: string, username: string, password: string) {
  const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.user.create({
    data: {
      email,
      username,
      // mirrors hashing in db/user
      password: hashedPassword
    }
  });
}

export async function deleteUserAccount(email: string) {
  console.log('deleting account', email);
  // deleteMany so that we dont get an error if we delete an account
  // that doesn't exist - for idempotent operation
  await prisma.user.deleteMany({
    where: {
      email
    }
  });
}

export async function performLogin(page: Page, email: string, password: string) {
  await page.goto('/login', {
    waitUntil: 'networkidle'
  });
  await expect(page).toHaveURL(/.*login/);
  expect((await page.textContent('h2')).trim()).toBe('Sign In');
  await expect(page.locator('button')).toBeVisible();

  // get previous lastlogindate
  const { lastLoginTimeUTC: prevLastLoginTimeUTC } = await prisma.user.findFirst({
    where: {
      email
    },
    select: {
      lastLoginTimeUTC: true
    }
  });

  await page.getByLabel('email').fill(email);
  await page.getByLabel('password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // await for login process to finish redirecting
  await expect(page).not.toHaveURL(/.*login/);

  // make sure that lastlogindate was updated
  const { lastLoginTimeUTC } = await prisma.user.findFirst({
    where: {
      email
    },
    select: {
      lastLoginTimeUTC: true
    }
  });
  // not checking timestamps bc dont know what it should be
  expect(lastLoginTimeUTC).not.toEqual(prevLastLoginTimeUTC);
}
