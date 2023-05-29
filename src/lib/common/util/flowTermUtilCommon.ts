import { FLOW_TERM_COUNT_MAX } from '../config/flowDataConfig';
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
