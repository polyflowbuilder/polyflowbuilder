import { prisma } from '$lib/server/db/prisma';
import { Prisma } from '@prisma/client';
import { initLogger } from '$lib/common/config/loggerConfig';
import type { Program, TemplateFlowchart } from '@prisma/client';

const logger = initLogger('DB/TemplateFlowchart');

export async function getTemplateFlowcharts(programIds: string[]): Promise<
  {
    flowchart: TemplateFlowchart;
    programMetadata: Program;
  }[]
> {
  // use raw query here bc Prisma doesn't currently use joins
  // and raw join here is much more efficient than the auto multi-query fetch
  // for relations that Prisma uses, see here:
  // https://github.com/prisma/prisma/discussions/8840
  // https://github.com/prisma/prisma/issues/4997

  const res = (
    await prisma.$queryRaw<
      (TemplateFlowchart & Program)[]
    >`SELECT * FROM TemplateFlowchart INNER JOIN Program ON programId = id WHERE programId IN (${Prisma.join(
      programIds
    )})`
  ).map((resEntry) => {
    const flowchart: TemplateFlowchart = {
      programId: resEntry.programId,
      termData: resEntry.termData,
      flowUnitTotal: resEntry.flowUnitTotal,
      notes: resEntry.notes,
      version: resEntry.version
    };
    const programMetadata: Program = {
      id: resEntry.id,
      catalog: resEntry.catalog,
      majorName: resEntry.majorName,
      concName: resEntry.concName,
      code: resEntry.code,
      dataLink: resEntry.dataLink
    };

    return {
      flowchart,
      programMetadata
    };
  });

  logger.info(`Successfully got template flowchart(s) ${programIds.join(',')}`);

  return res;
}
