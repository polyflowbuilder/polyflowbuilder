import { env } from '$env/dynamic/private';
import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();

// init PrismaClient once in dev env so we don't have to worry about
// hot reloading creating new connections and clients
if (env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export { prisma };
