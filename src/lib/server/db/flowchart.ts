import { Prisma } from '@prisma/client';
import { prisma } from '$lib/server/db/prisma';
import { initLogger } from '$lib/common/config/loggerConfig';
import {
  convertDBFlowchartToFlowchart,
  convertFlowchartToDBFlowchart
} from '$lib/server/util/flowDataUtil';
import type { MutateFlowchartData } from '$lib/types';

const logger = initLogger('DB/Flowchart');

// TODO: add tests for this?
export async function getUserFlowcharts(
  userId: string,
  ids: string[] = []
): Promise<MutateFlowchartData[]> {
  const res = await prisma.dBFlowchart.findMany({
    where: {
      ownerId: userId,
      ...(ids.length && {
        id: {
          in: ids
        }
      })
    },
    orderBy: {
      pos: 'asc'
    }
  });

  const resConverted = res.map((flow) => convertDBFlowchartToFlowchart(flow));

  logger.info('Fetched flowcharts for user', userId);

  return resConverted;
}

// TODO: pass in chunk list so we can compute which properties are changed (or do this in mutateUserDataUtilServer)
export async function updateFlowcharts(flowcharts: MutateFlowchartData[]): Promise<void> {
  // prepare data for interactive transaction
  const flowTransactionQueryPieces = flowcharts.map((flowchartData) => {
    const { id, ...dbFlow } = convertFlowchartToDBFlowchart(flowchartData);
    return {
      id,
      dbFlow
    };
  });

  // perform interactive transaction to update relevant flowcharts
  await prisma.$transaction(async (tx) => {
    for await (const { id, dbFlow } of flowTransactionQueryPieces) {
      // termData should never be falsy, always array-type and at minimum []
      if (!dbFlow.termData) {
        throw new Error('Flowchart termData should never be null');
      }

      await tx.dBFlowchart.update({
        where: {
          id
        },
        data: {
          // TODO: update only modified properties instead of blanket all
          // see https://github.com/prisma/prisma/issues/9247#issuecomment-1249322729
          ...dbFlow,
          // termData will never be null, but doing this to satisfy types
          termData: dbFlow.termData ?? Prisma.DbNull,
          // validationData CAN be null, though, so make sure we use DbNull here in that case
          validationData: dbFlow.validationData ?? Prisma.DbNull,
          // unset so prisma can automatically set update time
          lastUpdatedUTC: undefined
        }
      });
    }
  });

  logger.info(
    `Successfully persisted updates for flowcharts [${flowTransactionQueryPieces.map(
      (queryPiece) => queryPiece.id
    )}]`
  );
}
