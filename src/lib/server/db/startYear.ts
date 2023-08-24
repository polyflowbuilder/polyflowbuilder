import { prisma } from '$lib/server/db/prisma';

export async function getStartYears(): Promise<string[]> {
  return (await prisma.startYear.findMany()).map((startYear) => startYear.year);
}
