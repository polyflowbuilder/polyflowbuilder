import { prisma } from '$lib/server/db/prisma';
import { initLogger } from '$lib/common/config/loggerConfig';
import type { Program, TemplateFlowchart } from '@prisma/client';

const logger = initLogger('DB/TemplateFlowchart');

export async function getTemplateFlowcharts(programId: string[]): Promise<
  {
    flowchart: TemplateFlowchart;
    programMetadata: Program;
  }[]
> {
  const res = await prisma.templateFlowchart.findMany({
    where: {
      programId: {
        in: programId
      }
    },
    include: {
      programIdRelation: true
    }
  });

  const resConverted = res.map((templateFlowData) => {
    const { programIdRelation: programMetadata, ...templateFlowchart } = templateFlowData;
    return {
      flowchart: templateFlowchart,
      programMetadata
    };
  });

  logger.info(`Successfully got template flowchart(s) ${programId.join(',')}`);

  return resConverted;
}
