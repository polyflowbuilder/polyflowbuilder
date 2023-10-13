import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { TEST_FLOWCHART_SINGLE_PROGRAM_1 } from '../../../../tests/util/testFlowcharts';
import {
  computeTermUnits,
  computeTotalUnits,
  incrementRangedUnits
} from '$lib/common/util/unitCounterUtilCommon';
import type { Course } from '$lib/common/schema/flowchartSchema';
import type { ObjectSet } from '$lib/common/util/ObjectSet';
import type { APICourseFull } from '$lib/types';

// init API data
await apiDataConfig.init();

describe('incrementRangedUnits tests', () => {
  test('single number increments', () => {
    expect(incrementRangedUnits('10', '2')).toBe('12');
    expect(incrementRangedUnits('0', '1')).toBe('1');
    expect(incrementRangedUnits('10', '0')).toBe('10');
    expect(incrementRangedUnits('10', '3.5')).toBe('13.5');
  });

  test('test range -> range increments', () => {
    expect(incrementRangedUnits('1-2', '3-4')).toBe('4-6');
    expect(incrementRangedUnits('4-5', '1-12')).toBe('5-17');
    expect(incrementRangedUnits('0-5', '5-6')).toBe('5-11');
    expect(incrementRangedUnits('5-6', '0-1')).toBe('5-7');
    expect(incrementRangedUnits('5-6', '0-1.5')).toBe('5-7.5');
  });

  test('test single -> range increments', () => {
    expect(incrementRangedUnits('4', '1-2')).toBe('5-6');
    expect(incrementRangedUnits('0', '1-12')).toBe('1-12');
    expect(incrementRangedUnits('10', '4-8')).toBe('14-18');
    expect(incrementRangedUnits('6', '0-5')).toBe('6-11');
    expect(incrementRangedUnits('1.5', '3-4')).toBe('4.5-5.5');
    expect(incrementRangedUnits('5', '3-4.5')).toBe('8-9.5');
  });

  test('test range -> single increments', () => {
    expect(incrementRangedUnits('1-2', '3')).toBe('4-5');
    expect(incrementRangedUnits('4-5', '0')).toBe('4-5');
    expect(incrementRangedUnits('2-7', '1.5')).toBe('3.5-8.5');
  });
});

describe('computeTermUnits tests', () => {
  test('computeTermUnits with term that has no custom courses within one program and catalog', () => {
    const termData: Course[] = [
      {
        color: '#FEFD9A',
        id: 'AGC301'
      },
      {
        color: '#FEFD9A',
        id: 'AGB301'
      },
      {
        color: '#FEFD9A',
        id: 'JOUR312'
      }
    ];

    expect(
      computeTermUnits(
        termData,
        ['fd2f33be-3103-4b3d-a17b-94ced0d7998f'],
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData
      )
    ).toBe('12');
  });

  test('computeTermUnits with term that has no custom courses within two programs, one catalog', () => {
    const termData: Course[] = [
      {
        color: '#FEFD9A',
        id: 'AGC301'
      },
      {
        color: '#FEFD9A',
        id: 'AGB301',
        programIdIndex: 1
      },
      {
        color: '#FEFD9A',
        id: 'JOUR312'
      }
    ];

    expect(
      computeTermUnits(
        termData,
        ['fd2f33be-3103-4b3d-a17b-94ced0d7998f', '0edc1eaa-e7fb-40f1-bfef-9382a5bfd776'],
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData
      )
    ).toBe('12');
  });

  test('computeTermUnits with term that has no custom courses within two programs, two catalogs', () => {
    const termData: Course[] = [
      {
        color: '#FEFD9A',
        id: 'AGC301'
      },
      {
        color: '#FEFD9A',
        id: 'KINE134',
        programIdIndex: 1
      },
      {
        color: '#FEFD9A',
        id: 'JOUR312'
      }
    ];

    expect(
      computeTermUnits(
        termData,
        ['68be11b7-389b-4ebc-9b95-8997e7314497', 'cb65784d-23d6-44a9-ae7a-03b4b50d5b36'],
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData
      )
    ).toBe('9');
  });

  test('computeTermUnits with term that has custom courses, one program and catalog', () => {
    const termData: Course[] = [
      {
        color: '#FEFD9A',
        id: 'AGC301'
      },
      {
        color: '#FEFD9A',
        id: 'AGB301'
      },
      {
        color: '#FEFD9A',
        id: 'JOUR312'
      },
      {
        color: '#DCFDD2',
        customDesc:
          'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
        customUnits: '4-6',
        id: null,
        customId: 'GE'
      },
      {
        color: '#DA9593',
        customDesc:
          'Students can attempt to fulfill the requirement after 90 earned units; students should complete the requirement before senior year. Refer to current catalog for prerequisites. Any GWR class or GWR exam can go here.',
        id: null,
        customId: 'Graduation Writing Requirement'
      }
    ];

    expect(
      computeTermUnits(
        termData,
        ['fd2f33be-3103-4b3d-a17b-94ced0d7998f'],
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData
      )
    ).toBe('16-18');
  });

  test('computeTermUnits with term that has custom courses, two programs and two catalogs', () => {
    const termData: Course[] = [
      {
        color: '#FEFD9A',
        id: 'AGC301'
      },
      {
        color: '#FEFD9A',
        id: 'KINE134',
        programIdIndex: 1
      },
      {
        color: '#FEFD9A',
        id: 'JOUR312'
      },
      {
        color: '#DCFDD2',
        customDesc:
          'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
        customUnits: '4-6',
        id: null,
        customId: 'GE'
      },
      {
        color: '#DA9593',
        customDesc:
          'Students can attempt to fulfill the requirement after 90 earned units; students should complete the requirement before senior year. Refer to current catalog for prerequisites. Any GWR class or GWR exam can go here.',
        id: null,
        customId: 'Graduation Writing Requirement'
      }
    ];

    expect(
      computeTermUnits(
        termData,
        ['68be11b7-389b-4ebc-9b95-8997e7314497', 'cb65784d-23d6-44a9-ae7a-03b4b50d5b36'],
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData
      )
    ).toBe('13-15');
  });

  test('computeTermUnits with term that has mix of standard, standard+customUnits, and custom courses, one program and catalog', () => {
    const termData: Course[] = [
      // standard courses
      {
        color: '#FEFD9A',
        id: 'AGC301'
      },
      {
        color: '#FEFD9A',
        id: 'AGB301'
      },
      {
        color: '#FEFD9A',
        id: 'JOUR312'
      },
      // custom courses
      {
        color: '#DCFDD2',
        customDesc:
          'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
        customUnits: '4-6',
        id: null,
        customId: 'GE'
      },
      {
        color: '#DA9593',
        customDesc:
          'Students can attempt to fulfill the requirement after 90 earned units; students should complete the requirement before senior year. Refer to current catalog for prerequisites. Any GWR class or GWR exam can go here.',
        id: null,
        customId: 'Graduation Writing Requirement'
      },
      // standard+customUnits courses
      {
        color: '#FFFFFF',
        id: 'DATA401',
        customUnits: '5-8'
      }
    ];

    expect(
      computeTermUnits(
        termData,
        ['fd2f33be-3103-4b3d-a17b-94ced0d7998f'],
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData
      )
    ).toBe('21-26');
  });

  test('computeTermUnits unable to find course catalog', () => {
    const termData: Course[] = [
      {
        color: '#FEFD9A',
        id: 'AGC301'
      },
      {
        color: '#FEFD9A',
        id: 'AGB301'
      },
      {
        color: '#FEFD9A',
        id: 'JOUR312'
      }
    ];

    expect(() =>
      computeTermUnits(
        termData,
        ['032a4186-fc8a-4614-8c69-b3e43ae21df4'],
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData
      )
    ).toThrowError('unitCounterUtil: undefined courseCatalog');
  });

  test('computeTermUnits unable to find course metadata', () => {
    const courseCache1517Only = new Map([
      ['2015-2017', apiDataConfig.apiData.courseData.get('2015-2017') as ObjectSet<APICourseFull>]
    ]);

    const termData: Course[] = [
      {
        color: '#FEFD9A',
        id: 'AGC301'
      },
      {
        color: '#FEFD9A',
        id: 'AGB301'
      },
      {
        color: '#FEFD9A',
        id: 'JOUR312'
      }
    ];

    expect(() =>
      computeTermUnits(
        termData,
        ['fd2f33be-3103-4b3d-a17b-94ced0d7998f'],
        courseCache1517Only,
        apiDataConfig.apiData.programData
      )
    ).toThrowError('unitCounterUtil: unable to find course metadata for course AGC301');
  });
});

describe('computeTotalUnits tests', () => {
  const flowTermData = TEST_FLOWCHART_SINGLE_PROGRAM_1.termData;

  test('compute total units for empty flowchart', () => {
    expect(computeTotalUnits([], new Map(), [])).toBe('0');
  });

  test('compute total units for standard flowchart, no fullCompute', () => {
    expect(
      computeTotalUnits(
        flowTermData,
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData
      )
    ).toBe('196-198');
  });

  test('compute total units for standard flowchart, fullCompute no programId', () => {
    expect(() =>
      computeTotalUnits(
        flowTermData,
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData,
        true
      )
    ).toThrowError('computeTotalUnits: requested fullCompute with no programId');
  });

  test('compute total units for standard flowchart, fullCompute with programId', () => {
    expect(
      computeTotalUnits(
        flowTermData,
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData,
        true,
        ['fd2f33be-3103-4b3d-a17b-94ced0d7998f']
      )
    ).toBe('192-194');
  });
});
