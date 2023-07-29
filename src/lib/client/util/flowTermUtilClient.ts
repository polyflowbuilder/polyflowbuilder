import { generateTermString } from '$lib/common/util/flowTermUtilCommon';
import { FLOW_TERM_COUNT_MAX } from '$lib/common/config/flowDataConfig';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

export function generateMissingTermStrings(selectedFlow: Flowchart | undefined) {
  const termStrings = [];

  // start at tIndex 0, so no credit bin
  if (selectedFlow) {
    for (let i = 0; i < FLOW_TERM_COUNT_MAX; i += 1) {
      // optional since selectedFlow will be undefined if no flowchart selected
      if (selectedFlow.termData.findIndex((t) => t.tIndex === i) === -1) {
        termStrings.push({
          termIdx: i,
          termString: generateTermString(i, selectedFlow.startYear)
        });
      }
    }
  }

  return termStrings;
}
