import { prisma } from '$lib/server/db/prisma';
import { initLogger } from '$lib/common/config/loggerConfig';
import { convertDBFlowchartToFlowchart } from '$lib/server/util/flowDataUtil';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

const logger = initLogger('DB/Flowchart');

export async function getUserFlowcharts(userId: string): Promise<Flowchart[]> {
  const res = await prisma.dBFlowchart.findMany({
    where: {
      ownerId: userId
    }
  });

  const resConverted = res.map((flow) => convertDBFlowchartToFlowchart(flow));

  logger.info('Fetched flowcharts for user', userId);

  return resConverted;
}
