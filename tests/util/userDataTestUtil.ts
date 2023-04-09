import type { PrismaClient } from '@prisma/client';

export async function populateFlowcharts(prisma: PrismaClient, ownerId: string, count: number) {
  const ids: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const { id } = await prisma.dBFlowchart.create({
      data: {
        name: `test flow ${i}`,
        notes: '',
        unitTotal: '0',
        termData: [
          {
            tIndex: -1,
            courses: [],
            tUnits: '0'
          }
        ],
        version: 7,
        hash: '0cc175b9c0f1b6a831c399e269772661.0cc175b9c0f1b6a831c399e269772661',
        ownerId,
        startYear: '2020',
        programId1: '8e195e0c-73ce-44f7-a9ae-0212cd7c4b04',
        pos: i
      },
      select: {
        id: true
      }
    });

    ids.push(id);
  }

  return ids;
}
