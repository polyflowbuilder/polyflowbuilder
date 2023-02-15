import { prisma } from './prisma';
import { initLogger } from '$lib/config/loggerConfig';
import type { Flowchart } from '@prisma/client';

const logger = initLogger('DB/Flowchart');

export async function getUserFlowcharts(userId: string): Promise<Flowchart[]> {
  const res = await prisma.flowchart.findMany({
    where: {
      ownerId: userId
    }
  });

  logger.info('Fetched flowcharts for user', userId);

  return res;
}
