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
