// testing utilities related to user manipulation

import argon2 from 'argon2';
import { expect, Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

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
      password: hashedPassword,
      // mirrors newDataTemplate in db/user
      data: {
        flows: [],
        notifs: []
      }
    }
  });
}

export async function deleteUserAccount(email: string) {
  console.log('deleting account', email);
  await prisma.user.delete({
    where: {
      email
    }
  });
}

export async function performLogin(page: Page, email: string, password: string) {
  await page.goto('/login');
  await expect(page).toHaveURL(/.*login/);
  expect(await page.textContent('h2')).toBe('Sign In');
  await expect(page.locator('button')).toBeVisible();

  await page.getByLabel('email').fill(email);
  await page.getByLabel('password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // await for login process to finish redirecting
  await expect(page).not.toHaveURL(/.*login/);
}
