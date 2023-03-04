import { prisma } from '$lib/server/db/prisma';
import { initLogger } from '$lib/common/config/loggerConfig';
import type { TemplateFlowchart } from '@prisma/client';

const logger = initLogger('DB/TemplateFlowchart');

export async function getTemplateFlowcharts(programId: string[]): Promise<TemplateFlowchart[]> {
  const res = await prisma.templateFlowchart.findMany({
    where: {
      programId: {
        in: programId
      }
    }
  });

  logger.info(`Successfully got template flowchart(s) ${programId}`);

  return res;
}
