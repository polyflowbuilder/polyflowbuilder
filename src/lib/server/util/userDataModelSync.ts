// performs any server-side user data mutation before sending data to client.
// currently just includes updating flow data model versions before sending to client

import { apiData } from '$lib/server/config/apiDataConfig';
import { v4 as uuid } from 'uuid';
import { initLogger } from '$lib/common/config/loggerConfig';
import { dataModelVersion } from '$lib/common/schema/flowchartSchema';
import { generateFlowHash } from '$lib/common/util/flowDataUtilCommon';
import { FLOW_NAME_MAX_LENGTH } from '$lib/common/config/flowDataConfig';
import { computeTermUnits, computeTotalUnits } from '$lib/common/util/unitCounterUtilCommon';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

const logger = initLogger('Util/UserDataModelSync');

// TODO: put these types into a better place?

// <V6 types
interface FlowchartV5ModelQuarter {
  qIndex?: number;
  qUnits: number;
  qUnitsMax?: number;
  classes: {
    classId: string | null;
    cardColor: string;
    cCustomUnits?: string;
    cCustomCardTitle?: string;
    cCustomCardDisplayName?: string;
    cCustomNote?: string;
  }[];
}

interface FlowchartV5Model {
  flowName: string;
  flowMajor: string;
  flowConcentration: string;
  flowStartYear: string;
  flowCatalogYear: string;
  flowUnitTotal: string;
  flowNotes: string;
  flowHash?: string;
  dataModelVersion: number;
  cbData?: FlowchartV5ModelQuarter;
  data: FlowchartV5ModelQuarter[];
}

// V6 types
interface FlowchartV6ModelQuarter {
  tIndex: number;
  tUnits: string;
  classes: {
    cID: string | null;
    cardColor: string;
    cCustomID?: string;
    cCustomDisplayName?: string;
    cCustomUnits?: string;
    cCustomNote?: string;
    cProgramIDIndex?: number;
  }[];
}

// omitting validationData property bc this will not be transferred on model sync
interface FlowchartV6Model {
  flowName: string;
  flowId: string[];
  flowStartYear: string;
  flowUnitTotal: string;
  flowNotes: string;
  data: FlowchartV6ModelQuarter[];
  dataModelVersion: number;
  flowHash: string;
  publishedID: string | null;
  importedID: string | null;
}

export function checkUserFlowchartsDataVersion(
  ownerId: string,
  userFlowchartsOld: Record<string, unknown>[]
): {
  flowcharts: Flowchart[];
  userDataUpdated: boolean;
} {
  const flowcharts: Flowchart[] = [];
  let userDataUpdated = false;
  let numFlowsUpgraded = 0;

  for (const flowchart of userFlowchartsOld) {
    if (
      (!flowchart.dataModelVersion && !flowchart.version) ||
      (flowchart.dataModelVersion as number) < dataModelVersion ||
      (flowchart.version as number) < dataModelVersion
    ) {
      flowcharts.push(updateFlowchartDataModel(ownerId, flowchart));
      userDataUpdated = true;
      numFlowsUpgraded += 1;
    } else {
      flowcharts.push(flowchart as Flowchart);
    }
  }

  if (userDataUpdated) {
    logger.info(
      'performed data model upgrade,',
      numFlowsUpgraded,
      'flowcharts upgraded to data model version',
      dataModelVersion
    );
  }

  // TODO: perform flow schema validation in call to updateUserData()

  return {
    flowcharts,
    userDataUpdated
  };
}

export function updateFlowchartDataModel(
  ownerId: string,
  flow: Record<string, unknown>
): Flowchart {
  let newFlowchart = flow;

  // <v6 to v6
  while (!newFlowchart.version && newFlowchart.dataModelVersion !== 6) {
    if ((newFlowchart.dataModelVersion as number) < 6) {
      logger.info(
        'updated flowchart to datamodelversion 6 from version',
        newFlowchart.dataModelVersion
      );
      // type circus here bc the newFlowchart shape changes significantly
      newFlowchart = updateFlowchartDataVersionToV6(
        newFlowchart as unknown as FlowchartV5Model
      ) as unknown as Record<string, unknown>;
    }
  }

  // v6 to v7, do it this way bc we go from dataModelVersion -> version
  if (!newFlowchart.version) {
    // type circus here bc the newFlowchart shape changes significantly
    newFlowchart = updateFlowchartDataVersionToV7(
      ownerId,
      newFlowchart as unknown as FlowchartV6Model
    );
    logger.info('updated flowchart to version 7');
  }

  newFlowchart.hash = generateFlowHash(newFlowchart as Flowchart);

  return newFlowchart as Flowchart;
}

// from v6 to v7
function updateFlowchartDataVersionToV7(ownerId: string, flow: FlowchartV6Model): Flowchart {
  const programId = (typeof flow.flowId === 'string' ? [flow.flowId] : flow.flowId).map(
    (code) => Array.from(apiData.programData.values()).find((prog) => prog.code === code)?.id
  );

  if (programId.includes(undefined)) {
    throw new Error(`failed to map all flowId codes to programIds: ${flow.flowId.join(',')}`);
  }

  const updatedFlowchart: Flowchart = {
    id: uuid(),
    ownerId,
    name: String(flow.flowName).slice(0, FLOW_NAME_MAX_LENGTH),
    programId: programId as string[],
    startYear: flow.flowStartYear,
    unitTotal: flow.flowUnitTotal,
    notes: flow.flowNotes,
    termData: flow.data.map((term) => {
      const courses = term.classes.map((crs) => {
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
      });

      return {
        tIndex: term.tIndex,
        tUnits: computeTermUnits(
          courses,
          programId as string[],
          apiData.courseData,
          apiData.programData
        ),
        courses
      };
    }),
    version: 7,
    hash: '',
    publishedId: null,
    importedId: null,
    lastUpdatedUTC: new Date()
  };

  // recompute total units since some flows have them wrong
  updatedFlowchart.unitTotal = computeTotalUnits(
    updatedFlowchart.termData,
    apiData.courseData,
    apiData.programData
  );

  return updatedFlowchart;
}

// from <v6 to v6
function updateFlowchartDataVersionToV6(flow: FlowchartV5Model): FlowchartV6Model {
  const flowIDCatalogYear = apiData.catalogs
    .find((catalog) => catalog === flow.flowCatalogYear)
    ?.split('-')
    .map((year) => year.slice(2))
    .join('-');

  if (!flowIDCatalogYear) {
    throw new Error(
      `updateUserDataModelToV6: unable to locate catalog for flow, catalog ${flow.flowCatalogYear}`
    );
  }

  // some prod data has null terms
  const oldFlowData = flow.data as (FlowchartV5ModelQuarter | null)[];

  // require cbdata now
  if (flow.cbData) {
    const newCBData = flow.cbData;
    newCBData.qIndex = -1; // so the next step turns this into tIndex
    oldFlowData.unshift(newCBData); // so CB data is in the beginning
  } else {
    // use old schema so it gets converted properly
    oldFlowData.unshift({
      qIndex: -1,
      qUnits: 0,
      classes: []
    });
  }

  const newFlowData = [] as FlowchartV6Model['data'];
  oldFlowData.forEach((qtrData) => {
    // remove null terms
    if (!qtrData) {
      return;
    }

    const tIndex: number = parseInt(String(qtrData.qIndex));
    const tUnits: string = qtrData.qUnitsMax
      ? `${qtrData.qUnits}-${qtrData.qUnitsMax}`
      : `${qtrData.qUnits}`;
    const classes = [] as FlowchartV6ModelQuarter['classes'];

    qtrData.classes.forEach((cData) => {
      const cDataNew = deleteObjectProperties(
        {
          ...cData,
          cID: cData.classId,
          cardColor: RGBToHex(cData.cardColor),
          cCustomID: cData.cCustomCardTitle,
          cCustomDisplayName: cData.cCustomCardDisplayName
        },
        ['classId', 'cCustomCardTitle', 'cCustomCardDisplayName']
      ) as FlowchartV6ModelQuarter['classes'][0];

      // to force custom courses to have a cCustomID
      if (!cDataNew.cID && !cDataNew.cCustomID) {
        cDataNew.cCustomID = '?';
      }

      // some prod data has backwards min-max unit counts, flip em
      if (cDataNew.cCustomUnits?.includes('-')) {
        const parts = cDataNew.cCustomUnits.split('-');
        if (Number(parts[0]) > Number(parts[1])) {
          cDataNew.cCustomUnits = `${parts[1]}-${parts[0]}`;
        }
      }

      classes.push(cDataNew);
    });

    newFlowData.push({
      tIndex,
      tUnits,
      classes
    });
  });

  const flowchartV6 = {
    flowName: String(flow.flowName),
    flowId: [
      `${flowIDCatalogYear}.${flow.flowMajor}${
        flow.flowConcentration ? '.' + flow.flowConcentration : ''
      }`
    ],
    flowStartYear: String(flow.flowStartYear),
    flowUnitTotal: String(flow.flowUnitTotal),
    flowNotes: String(flow.flowNotes || ''),
    data: newFlowData,
    publishedID: null,
    importedID: null,
    dataModelVersion: 6
  } as FlowchartV6Model;
  // purge validation data, force regeneration

  return flowchartV6;
}

function RGBToHex(rgb: string): string {
  // Choose correct separator
  const sep = rgb.includes(',') ? ',' : ' ';
  // Turn "rgb(r,g,b)" into [r,g,b]
  const rgbArr = rgb.substring(4).split(')')[0].split(sep);

  let r = (+rgbArr[0]).toString(16),
    g = (+rgbArr[1]).toString(16),
    b = (+rgbArr[2]).toString(16);

  r = r.length == 1 ? '0' + r : r;
  g = g.length == 1 ? '0' + g : g;
  b = b.length == 1 ? '0' + b : b;

  return ('#' + r + g + b).toUpperCase();
}

// see testUtil.ts
export function deleteObjectProperties(object: Record<string, unknown>, properties: string[]) {
  const excludeKeys = new Set(properties);

  return Object.fromEntries(Object.entries(object).filter(([key]) => !excludeKeys.has(key)));
}
