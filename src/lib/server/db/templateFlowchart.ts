import { prisma } from '$lib/server/db/prisma';
import { initLogger } from '$lib/common/config/loggerConfig';
import type { TemplateFlowchart } from '@prisma/client';

const logger = initLogger('DB/TemplateFlowchart');

export async function getTemplateFlowcharts(programIds: string[]): Promise<TemplateFlowchart[]> {
  const res = await prisma.templateFlowchart.findMany({
    where: {
      programId: {
        in: programIds
      }
    }
  });

  logger.info(`Successfully got template flowchart(s) ${programIds.join(',')}`);

  return res;
}
