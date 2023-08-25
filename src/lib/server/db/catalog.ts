import { prisma } from '$lib/server/db/prisma';

export async function getCatalogs(): Promise<string[]> {
  return (await prisma.catalog.findMany()).map(({ catalog }) => catalog);
}
