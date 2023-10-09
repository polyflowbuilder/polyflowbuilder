import { prisma } from '$lib/server/db/prisma';

export async function getStartYears(): Promise<string[]> {
  return (
    await prisma.startYear.findMany({
      // order is indeterministic without explicit sort
      orderBy: {
        year: 'asc'
      }
    })
  ).map((startYear) => startYear.year);
}

export async function validateStartYear(startYear: string): Promise<boolean> {
  const res = await prisma.startYear.findMany({
    where: {
      year: {
        in: [startYear]
      }
    }
  });
  return !!res.length;
}
