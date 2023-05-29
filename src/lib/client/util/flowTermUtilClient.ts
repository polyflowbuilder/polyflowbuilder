import { FLOW_TERM_COUNT_MAX } from '$lib/common/config/flowDataConfig';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

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
        termString += ' ' + startingYear;
        break;
      }
      case 1: {
        termString += ' ' + startingYear;
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

export function generateMissingTermStrings(selectedFlow: Flowchart) {
  const termStrings = [];

  // start at tIndex 0, so no credit bin
  for (let i = 0; i < FLOW_TERM_COUNT_MAX; i += 1) {
    // optional since selectedFlow may be undefined
    if (selectedFlow?.termData.findIndex((t) => t.tIndex === i) === -1) {
      termStrings.push({
        termIdx: i,
        termString: generateTermString(i, selectedFlow.startYear)
      });
    }
  }

  return termStrings;
}
