import type { PrismaClient, TokenType } from '@prisma/client';

export async function createToken(
  prisma: PrismaClient,
  email: string,
  type: TokenType,
  expireNow = false
) {
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + 30);
  await prisma.token.create({
    data: {
      email,
      token: 'testtoken',
      type,
      expiresUTC: expireNow ? new Date(Date.now()) : expiryDate
    }
  });
}
