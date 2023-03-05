/* eslint-disable @typescript-eslint/no-explicit-any */
// performs any server-side user data mutation before sending data to client.
// currently just includes updating flow data model versions before sending to client

import { apiData } from '$lib/server/config/apiDataConfig';
import { v4 as uuid } from 'uuid';
import { initLogger } from '$lib/common/config/loggerConfig';
import { dataModelVersion } from '$lib/common/schema/flowchartSchema';
import { generateFlowHash } from '$lib/common/util/flowDataUtilCommon';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

const logger = initLogger('Server/Util/UserDataModelSync');

export function checkUserFlowchartsDataVersion(
  ownerId: string,
  userFlowchartsOld: any[]
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
      flowchart.dataModelVersion < dataModelVersion ||
      flowchart.version < dataModelVersion
    ) {
      flowcharts.push(
        updateFlowchartDataModel(
          {
            ownerId,
            catalogs: apiData.catalogs
          },
          flowchart
        )
      );
      userDataUpdated = true;
      numFlowsUpgraded += 1;
    } else {
      flowcharts.push(flowchart);
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
  inputData: {
    ownerId: string;
    catalogs: string[];
  },
  flow: any
): Flowchart {
  let newFlowchart: any = flow;

  // v5 to v6
  // TODO: REMOVE THIS LOOP!! WILL CAUSE ISSUES WITH NEW .version IN V7!!
  while (newFlowchart.dataModelVersion !== dataModelVersion) {
    if (newFlowchart.dataModelVersion < 6) {
      newFlowchart = updateFlowchartDataVersionToV6(inputData.catalogs, newFlowchart);
    }
  }

  // v6 to v7, do it this way bc we go from dataModelVersion -> version
  if (!newFlowchart.version) {
    newFlowchart = updateFlowchartDataVersionToV7(inputData.ownerId, newFlowchart);
  }

  newFlowchart.flowHash = generateFlowHash(newFlowchart);

  return newFlowchart;
}

// from v6 to v7
function updateFlowchartDataVersionToV7(ownerId: string, flow: any): Flowchart {
  const updatedFlowchart: Flowchart = {
    id: uuid(),
    ownerId,
    name: flow.flowName,
    programId: typeof flow.flowName === 'string' ? [flow.flowName] : flow.flowName,
    startYear: flow.flowStartYear,
    unitTotal: flow.flowUnitTotal,
    notes: flow.flowNotes,
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
    hash: '',
    publishedId: null,
    importedId: null,
    lastUpdatedUTC: new Date()
  };

  return updatedFlowchart;
}

// from v5 to v6
function updateFlowchartDataVersionToV6(catalogs: string[], flow: any): any {
  const flowIDCatalogYear = catalogs
    .find((catalog) => catalog === flow.flowCatalogYear)
    ?.replaceAll('20', '');

  if (!flowIDCatalogYear) {
    throw new Error(
      `updateUserDataModelToV6: unable to locate catalog for flow, catalog ${flow.flowCatalogYear}`
    );
  }

  const oldFlowData = flow.data;

  // require cbdata now
  if (flow.cbData) {
    const newCBData = flow.cbData;
    newCBData.qIndex = -1; // so the next step turns this into tIndex
    oldFlowData.unshift(newCBData); // so CB data is in the beginning
  } else {
    // use old schema so it gets converted properly
    oldFlowData.unshift({
      qIndex: -1,
      qUnits: '0',
      classes: []
    });
  }

  const newFlowData: any[] = [];
  oldFlowData.forEach((qtrData: any) => {
    const tIndex: number = parseInt(qtrData.qIndex);
    const tUnits: string = qtrData.qUnitsMax
      ? `${qtrData.qUnits}-${qtrData.qUnitsMax}`
      : `${qtrData.qUnits}`;
    const classes: any[] = [];

    qtrData.classes.forEach((cData: any) => {
      const cDataNew = {
        ...cData,
        cID: cData.classId,
        cardColor: RGBToHex(cData.cardColor),
        cCustomID: cData.cCustomCardTitle,
        cCustomDisplayName: cData.cCustomCardDisplayName
      };
      delete cDataNew.classId;
      delete cDataNew.cCustomCardTitle;
      delete cDataNew.cCustomCardDisplayName;

      // to force custom courses to have a cCustomID
      if (!cDataNew.cID && !cDataNew.cCustomID) {
        cDataNew.cCustomID = '?';
      }

      classes.push(cDataNew);
    });

    newFlowData.push({
      tIndex,
      tUnits,
      classes
    });
  });

  const flowchartV6: any = {
    flowName: String(flow.flowName),
    flowId: [
      `${flowIDCatalogYear}.${flow.flowMajor}${
        flow.flowConcentration ? '.' + flow.flowConcentration : ''
      }`
    ],
    flowStartYear: String(flow.flowStartYear),
    flowUnitTotal: String(flow.flowUnitTotal),
    flowNotes: String(flow.flowNotes),
    data: newFlowData,
    publishedID: null,
    importedID: null,
    dataModelVersion: 6
  };
  // purge validation data, force regeneration

  return flowchartV6;
}

function RGBToHex(rgb: string): string {
  // Choose correct separator
  const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
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
