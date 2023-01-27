// CRUD operations regarding user data
import argon2 from 'argon2';
import { prisma } from '$lib/server/db/prisma';
import type { UserData } from '$lib/types';
import type { Prisma, User } from '@prisma/client';

export async function createUser(registerData: {
  username: string;
  email: string;
  password: string;
}): Promise<string | null> {
  const newDataTemplate: UserData = {
    flows: [],
    notifs: []
  };

  const user = await prisma.user.findUnique({
    where: {
      email: registerData.email
    }
  });

  if (user) {
    console.log('New user attempted to register with existing email');
    return null;
  } else {
    await prisma.user.create({
      data: {
        username: registerData.username,
        password: await argon2.hash(registerData.password, { type: argon2.argon2id }),
        email: registerData.email,
        data: newDataTemplate
      }
    });
  }

  console.log(`User with email [${registerData.email}] successfully added to master database`);
  return registerData.email;
}

// TODO: move the updateLoginDate to somewhere else more appropriate?
export async function getUserByEmail(email: string, updateLoginDate = false): Promise<User | null> {
  // TODO: reconsider cache

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (user && updateLoginDate) {
    await prisma.user.update({
      where: {
        email
      },
      data: {
        lastLoginTimeUTC: new Date()
      }
    });
  }

  return user;
}

export async function updateUser(email: string, data: Prisma.UserUpdateInput): Promise<void> {
  await prisma.user.update({
    where: {
      email
    },
    data
  });
}
