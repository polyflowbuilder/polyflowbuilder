/* eslint-disable @typescript-eslint/no-explicit-any */

// mostly a duplicate of userDataModelSync so we don't import SK-specific modules such as $env
// as these can't be resolved by tsx when running these files

// also need to use something like tsx that uses a bundler like esbuild in it
// instead of ts-node-esm (which uses native tsc)
// because the typescript compiler DOES NOT RESOLVE PATH ALIASES!!
// this has been a huge pain point in the TS community, see here:
// https://github.com/microsoft/TypeScript/issues/10866
// https://www.devxperiences.com/pzwp1/2021/11/21/how-to-solve-the-problem-with-typescript-unresolved-path-aliases-in-transpiled-js-files/

import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { Program } from '@prisma/client';

// from v6 to v7
// special version for template flows that hardcodes some data to pass validation checks
export function updateFlowchartDataVersionToV7(programData: Program[], flow: any): Flowchart {
  const programId = (
    typeof flow.flowId === 'string' ? [flow.flowId] : (flow.flowId as string[])
  ).map((code) => programData.find((prog) => prog.code === code)?.id);

  const updatedFlowchart: Flowchart = {
    id: '11111111-1111-1111-1111-111111111111',
    ownerId: '11111111-1111-1111-1111-111111111111',
    name: flow.flowName,
    programId,
    startYear: flow.flowStartYear,
    unitTotal: String(flow.flowUnitTotal),
    notes: flow.flowNotes ?? '',
    termData: flow.data.map((term: any) => {
      return {
        tIndex: term.tIndex,
        tUnits: term.tUnits,
        courses: term.classes.map((crs: any) => {
          return {
            id: crs.cID,
            color: crs.cardColor,
            customId: crs.cCustomID,
            customDisplayName: crs.cCustomDisplayName,
            customUnits: crs.cCustomUnits,
            customDesc: crs.cCustomNote,
            ...(crs.cProgramIDIndex &&
              crs.cProgramIDIndex !== 0 && { programIdIndex: crs.cProgramIDIndex })
          };
        })
      };
    }),
    version: 7,
    hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    publishedId: null,
    importedId: null,
    lastUpdatedUTC: new Date()
  };

  return updatedFlowchart;
}
