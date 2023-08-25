import { prisma } from '$lib/server/db/prisma';
import type { Program } from '@prisma/client';

export async function getProgramsFromIds(programIds: string[]): Promise<Program[]> {
  return await prisma.program.findMany({
    where: {
      id: {
        in: programIds
      }
    }
  });
}

export async function getProgramMajorsFromCatalog(catalog: string): Promise<string[]> {
  // use raw query bc Prisma by default uses SELECT + in-memory post-processing
  // for distinct instead of SELECT DISTINCT (which is not ideal in our case)
  // see https://www.prisma.io/docs/concepts/components/prisma-client/aggregation-grouping-summarizing#select-distinct
  return (
    await prisma.$queryRaw<
      {
        majorName: string;
      }[]
    >`SELECT DISTINCT majorName FROM Program WHERE catalog = ${catalog} ORDER BY majorName ASC;`
  ).map(({ majorName }) => majorName);
}

export async function getProgramsFromCatalogMajor(
  catalog: string,
  majorName: string
): Promise<Program[]> {
  return await prisma.program.findMany({
    where: {
      catalog,
      majorName
    },
    orderBy: {
      concName: 'asc'
    }
  });
}
