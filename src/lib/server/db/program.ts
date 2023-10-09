import { prisma } from '$lib/server/db/prisma';
import type { Program } from '@prisma/client';

export async function getProgramsFromIds(programIds: string[]): Promise<Program[]> {
  const res = await prisma.program.findMany({
    where: {
      id: {
        in: programIds
      }
    }
  });

  // need to sort records from db because their order is indeterministic
  // and in this context the order of the records needs to exactly match
  // the order of the input or else downstream routines could fail
  // see templateFlowchart.ts
  const sortedRes = res
    .map((prog) => {
      const idx = programIds.findIndex((id) => prog.id === id);
      if (idx === -1) {
        throw new Error(
          `program: cannot find program ID ${
            prog.id
          } in input program ID list ${programIds.toString()}`
        );
      }

      return {
        idx,
        prog
      };
    })
    .sort((a, b) => a.idx - b.idx)
    .map(({ prog }) => prog);

  return sortedRes;
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
