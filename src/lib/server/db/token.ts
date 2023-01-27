import { Prisma, type TokenType } from '@prisma/client';
import { prisma } from '$lib/server/db/prisma';

export async function expireAndInsertToken(
  email: string,
  type: TokenType,
  token: string,
  expiry: Date
): Promise<boolean> {
  await prisma.token.deleteMany({
    where: {
      email,
      type
    }
  });
  console.log(type, 'tokens expired for', email);

  try {
    await prisma.token.create({
      data: {
        email,
        token,
        type,
        expiresUTC: expiry
      }
    });
    console.log('new', type, 'token created for', email);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003' &&
      error.meta?.field_name === 'email'
    ) {
      console.log('attempted to create a token for a nonexistent user, abort');

      return false;
    } else {
      // make sure loggers catch this error if it's one we're not expecting
      throw error;
    }
  }

  return true;
}

export async function validateToken(
  email: string,
  token: string,
  type: TokenType
): Promise<boolean> {
  const res = await prisma.token.findFirst({
    where: {
      email,
      token,
      type
    },
    select: {
      expiresUTC: true
    }
  });

  if (!res) {
    console.log(type, 'token for', email, 'is invalid as it does not exist');
    return false;
  }

  if (new Date(res.expiresUTC).getTime() < Date.now()) {
    console.log(type, 'token for', email, 'has expired');
    return false;
  }

  console.log(type, 'token for', email, 'is valid');
  return true;
}

export async function clearTokensByEmail(email: string, type: TokenType): Promise<void> {
  await prisma.token.deleteMany({
    where: {
      email,
      type
    }
  });
}
