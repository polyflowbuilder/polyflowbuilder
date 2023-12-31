import { PrismaClient } from '@prisma/client';

const prisma = global.prisma_DO_NOT_IMPORT ?? new PrismaClient();

// init PrismaClient once in dev env so we don't have to worry about
// hot reloading creating new connections and clients
// see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
if (process.env.NODE_ENV === 'development') {
  global.prisma_DO_NOT_IMPORT = prisma;
} else {
  global.prisma_DO_NOT_IMPORT = undefined;
}

export { prisma };
