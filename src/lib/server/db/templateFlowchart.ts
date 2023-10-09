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

  // need to sort records from db because their order is indeterministic
  // and in this context the order of the records needs to exactly match
  // the order of the input or else downstream routines will fail
  const sortedRes = res
    .map((flowchart) => {
      const idx = programIds.findIndex((id) => flowchart.programId === id);
      if (idx === -1) {
        throw new Error(
          `templateFlowchart: cannot find program ID ${
            flowchart.programId
          } in input program ID list ${programIds.toString()}`
        );
      }

      return {
        idx,
        flowchart
      };
    })
    .sort((a, b) => a.idx - b.idx)
    .map(({ flowchart }) => flowchart);

  logger.info(`Successfully got template flowchart(s) ${programIds.join(',')}`);

  return sortedRes;
}
