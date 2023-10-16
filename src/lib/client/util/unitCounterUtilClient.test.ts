import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { ObjectMap } from '$lib/common/util/ObjectMap';
import { computeGroupUnits } from '$lib/client/util/unitCounterUtilClient';
import { TEST_FLOWCHART_SINGLE_PROGRAM_1 } from '../../../../tests/util/testFlowcharts';

// init api data
await apiDataConfig.init();

// TODO: add tests for multiple programs

describe('computeGroupUnits tests', () => {
  test('null flowchart', () => {
    const expectedCounts = {
      major: '0',
      support: '0',
      conc1: '0',
      conc2: '0',
      ge: '0',
      elective: '0',
      other: '0',
      total: '0'
    };

    expect(computeGroupUnits(null, new ObjectMap(), new Map())).toStrictEqual(expectedCounts);
  });

  test('standard flowchart, 1 program', () => {
    const expectedCounts = {
      major: '132-133',
      support: '0',
      conc1: '0',
      conc2: '0',
      ge: '44',
      elective: '3-4',
      other: '13',
      total: '500'
    };

    expect(
      computeGroupUnits(
        TEST_FLOWCHART_SINGLE_PROGRAM_1,
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData
      )
    ).toStrictEqual(expectedCounts);
  });

  test('error thrown when unable to find course metadata entry', () => {
    expect(() => {
      computeGroupUnits(TEST_FLOWCHART_SINGLE_PROGRAM_1, new ObjectMap(), new Map());
    }).toThrowError('unitCounterUtilClient: unable to locate course metadata for course AGC102');
  });
});
