// CRUD operations for session data

import { SESSION_MAX_AGE } from '$lib/config/envConfig.server';

export async function upsertSession(userId: string): Promise<string> {
  const expiryDate = new Date(new Date().getTime() + 1000 * SESSION_MAX_AGE);

  const { sessionId } = await prisma.session.upsert({
    create: {
      userId,
      expiresUTC: expiryDate
    },
    update: {
      expiresUTC: expiryDate
    },
    where: {
      userId
    },
    select: {
      sessionId: true
    }
  });

  return sessionId;
}
