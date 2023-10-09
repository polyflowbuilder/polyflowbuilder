import { prisma } from '$lib/server/db/prisma';

export async function getCatalogs(): Promise<string[]> {
  return (
    await prisma.catalog.findMany({
      // order is indeterministic without explicit sort
      orderBy: {
        catalog: 'asc'
      }
    })
  ).map(({ catalog }) => catalog);
}
