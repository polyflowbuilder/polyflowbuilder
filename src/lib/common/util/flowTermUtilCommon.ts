import { ObjectMap } from '$lib/common/util/ObjectMap';
import { computeTotalUnits } from '$lib/common/util/unitCounterUtilCommon';
import { FLOW_TERM_COUNT_MAX } from '$lib/common/config/flowDataConfig';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

export function performAddTerms(termAddIdxs: number[], flowchart: Flowchart): Flowchart {
  const newFlowchart = flowchart;
  const existingTermIndexes = new Set(flowchart.termData.map((t) => t.tIndex));

  termAddIdxs.forEach((tIndex) => {
    // if a term to be added already exists, ignore
    if (existingTermIndexes.has(tIndex)) {
      return;
    }

    let insertIdx = newFlowchart.termData.findIndex((t) => tIndex < t.tIndex);
    insertIdx = insertIdx !== -1 ? insertIdx : FLOW_TERM_COUNT_MAX - 1;

    newFlowchart.termData.splice(insertIdx, 0, {
      tIndex,
      tUnits: '0',
      courses: []
    });
  });

  return newFlowchart;
}

// effectively just a wrapper
export function performDeleteTerms(termDeleteIdxs: number[], flowchart: Flowchart): Flowchart {
  const newFlowchart = flowchart;
  newFlowchart.termData = newFlowchart.termData.filter(
    (termData) => !termDeleteIdxs.includes(termData.tIndex)
  );
  newFlowchart.unitTotal = computeTotalUnits(newFlowchart.termData, new ObjectMap(), new Map());
  return newFlowchart;
}

export function generateTermString(termIdx: number, flowStartYear: string): string {
  let termString = '';

  if (termIdx === -1) {
    termString = 'Credit Bin';
  } else {
    // Summer [startingYearString] will be tIndex 0, and increment from there
    const startingYear = parseInt(flowStartYear);

    switch (termIdx % 4) {
      case 0: {
        termString += 'Summer';
        break;
      }
      case 1: {
        termString += 'Fall';
        break;
      }
      case 2: {
        termString += 'Winter';
        break;
      }
      case 3: {
        termString += 'Spring';
        break;
      }
    }

    // first two terms are an anomaly
    switch (termIdx) {
      case 0: {
        termString += ' ' + startingYear.toString();
        break;
      }
      case 1: {
        termString += ' ' + startingYear.toString();
        break;
      }
      default: {
        termString += ' ' + (startingYear + Math.floor((termIdx - 2) / 4) + 1).toString();
        break;
      }
    }
  }

  return termString;
}
