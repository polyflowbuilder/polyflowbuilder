// tests for flowTermUtilCommon

// TODO: add tests for other flowTermUtilCommon functions

import { generateTermString } from '$lib/common/util/flowTermUtilCommon';

// just a sample
const FLOW_START_YEARS = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];

describe('generateTermString tests', () => {
  test('credit bin case', () => {
    expect(generateTermString(-1, 'any')).toBe('Credit Bin');
  });

  test('anomalous index cases', () => {
    const flowStartYear = FLOW_START_YEARS[Math.floor(Math.random() * FLOW_START_YEARS.length)];
    expect(generateTermString(0, flowStartYear)).toBe(`Summer ${flowStartYear}`);
    expect(generateTermString(1, flowStartYear)).toBe(`Fall ${flowStartYear}`);
  });

  test('standard index cases', () => {
    const flowStartYear = FLOW_START_YEARS[Math.floor(Math.random() * FLOW_START_YEARS.length)];

    // term indexes 2, 3, 10, 15, 13, 24
    const expectedTermStrings = [
      `Winter ${(parseInt(flowStartYear) + 1).toString()}`,
      `Spring ${(parseInt(flowStartYear) + 1).toString()}`,
      `Winter ${(parseInt(flowStartYear) + 3).toString()}`,
      `Spring ${(parseInt(flowStartYear) + 4).toString()}`,
      `Fall ${(parseInt(flowStartYear) + 3).toString()}`,
      `Summer ${(parseInt(flowStartYear) + 6).toString()}`
    ];

    expect(generateTermString(2, flowStartYear)).toBe(expectedTermStrings[0]);
    expect(generateTermString(3, flowStartYear)).toBe(expectedTermStrings[1]);
    expect(generateTermString(10, flowStartYear)).toBe(expectedTermStrings[2]);
    expect(generateTermString(15, flowStartYear)).toBe(expectedTermStrings[3]);
    expect(generateTermString(13, flowStartYear)).toBe(expectedTermStrings[4]);
    expect(generateTermString(24, flowStartYear)).toBe(expectedTermStrings[5]);
  });
});
