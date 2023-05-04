import { incrementRangedUnits } from '$lib/common/util/unitCounterUtilCommon';
import { CURRENT_FLOW_DATA_VERSION } from '$lib/common/config/flowDataConfig';
import type { PrismaClient } from '@prisma/client';

export async function populateFlowcharts(
  prisma: PrismaClient,
  ownerId: string,
  count: number,
  populatedFlowcharts: {
    idx: number;
    info: {
      termCount: number;
      longTermCount: number;
    };
  }[] = []
) {
  const ids: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const flowCustomizationInfo = populatedFlowcharts.find((entry) => entry.idx === i);

    const flowData = {
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
      version: CURRENT_FLOW_DATA_VERSION,
      hash: '0cc175b9c0f1b6a831c399e269772661.0cc175b9c0f1b6a831c399e269772661',
      ownerId,
      startYear: '2020',
      programId1: '8e195e0c-73ce-44f7-a9ae-0212cd7c4b04',
      pos: i
    };

    if (flowCustomizationInfo) {
      for (let j = 0; j < flowCustomizationInfo.info.termCount; j += 1) {
        flowData.termData.push({
          tIndex: j,
          tUnits: '13',
          courses: [
            {
              id: null,
              color: '#FFFFFF',
              customId:
                '0--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
              customUnits: '5',
              customDisplayName:
                'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
            },
            {
              id: 'MATH142',
              color: '#FEFD9A'
            },
            {
              id: 'MATH153',
              color: '#FCD09E'
            },
            {
              id: 'MATH96',
              color: '#F9A3D2'
            }
          ]
          // need to do this typecast to get around weird TS never[] assignment
        } as never);

        flowData.unitTotal = incrementRangedUnits(flowData.unitTotal, '13');
      }

      for (let j = 0; j < flowCustomizationInfo.info.longTermCount; j += 1) {
        flowData.termData.push({
          tIndex: flowCustomizationInfo.info.termCount + j,
          tUnits: '45',
          courses: [
            {
              id: null,
              color: '#FFFFFF',
              customId:
                'longestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlon',
              customUnits: '5',
              customDisplayName:
                'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
            },
            {
              id: null,
              color: '#BFBFBF',
              customId:
                '1--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
              customUnits: '5',
              customDisplayName:
                'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
            },
            {
              id: 'MATH151',
              color: '#D4FFFE'
            },
            {
              id: 'MATH118',
              color: '#D4FFFE'
            },
            {
              id: null,
              color: '#D4FFFE',
              customId:
                '2--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
              customUnits: '5',
              customDisplayName:
                'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
            },
            {
              id: null,
              color: '#DCFDD2',
              customId:
                '3-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
              customUnits: '5',
              customDisplayName:
                'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
            },
            {
              id: null,
              color: '#DCFDD2',
              customId:
                '4-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
              customUnits: '5',
              customDisplayName:
                'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
            },
            {
              id: null,
              color: '#FFCCFF',
              customId:
                '5-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
              customUnits: '5',
              customDisplayName:
                'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
            },
            {
              id: null,
              color: '#F9A3D2',
              customId:
                '6-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
              customUnits: '5',
              customDisplayName:
                'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
            },
            {
              id: null,
              color: '#FCD09E',
              customId:
                '7-- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
              customUnits: '5',
              customDisplayName:
                'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
            }
          ]
          // need to do this typecast to get around weird TS never[] assignment
        } as never);

        flowData.unitTotal = incrementRangedUnits(flowData.unitTotal, '45');
      }
    }

    const { id } = await prisma.dBFlowchart.create({
      data: flowData,
      select: {
        id: true
      }
    });

    ids.push(id);
  }

  return ids;
}
