// CRUD operations regarding user data
import argon2 from 'argon2';
import { prisma } from '$lib/server/db/prisma';
import { initLogger } from '$lib/config/loggerConfig';
import type { Prisma, User } from '@prisma/client';

const logger = initLogger('DB/User');

export async function createUser(registerData: {
  username: string;
  email: string;
  password: string;
}): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: {
      email: registerData.email
    }
  });

  if (user) {
    logger.info('New user attempted to register with existing email');
    return null;
  } else {
    await prisma.user.create({
      data: {
        username: registerData.username,
        password: await argon2.hash(registerData.password, { type: argon2.argon2id }),
        email: registerData.email
      }
    });
  }

  logger.info(`User with email [${registerData.email}] successfully added to master database`);
  return registerData.email;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  // TODO: reconsider cache

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

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
