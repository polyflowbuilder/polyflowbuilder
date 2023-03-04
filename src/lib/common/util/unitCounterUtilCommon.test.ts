import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import {
  incrementRangedUnits,
  computeTermUnits,
  computeTotalUnits
} from '$lib/common/util/unitCounterUtilCommon';
import type { CourseCache } from '$lib/types';
import type { Course, Term } from '$lib/common/schema/flowchartSchema';

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
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2021-2022'
    );
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
        courseCache,
        apiDataConfig.apiData.programData
      )
    ).toBe('12');
  });

  test('computeTermUnits with term that has no custom courses within two programs, one catalog', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2021-2022'
    );
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
        courseCache,
        apiDataConfig.apiData.programData
      )
    ).toBe('12');
  });

  test('computeTermUnits with term that has no custom courses within two programs, two catalogs', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2015-2017' || crsData.catalog === '2022-2026'
    );
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
        courseCache,
        apiDataConfig.apiData.programData
      )
    ).toBe('9');
  });

  test('computeTermUnits with term that has custom courses, one program and catalog', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2021-2022'
    );
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
        courseCache,
        apiDataConfig.apiData.programData
      )
    ).toBe('16-18');
  });

  test('computeTermUnits with term that has custom courses, two programs and two catalogs', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2015-2017' || crsData.catalog === '2022-2026'
    );
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
        courseCache,
        apiDataConfig.apiData.programData
      )
    ).toBe('13-15');
  });

  test('computeTermUnits unable to find course catalog', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2015-2017'
    );
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
        courseCache,
        apiDataConfig.apiData.programData
      )
    ).toThrowError('unitCounterUtil: undefined courseCatalog');
  });

  test('computeTermUnits unable to find course metadata', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2015-2017'
    );
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
        courseCache,
        apiDataConfig.apiData.programData
      )
    ).toThrowError('unitCounterUtil: unable to find course metadata for course AGC301');
  });
});

describe('computeTotalUnits tests', () => {
  const flowTermData: Term[] = [
    {
      tIndex: -1,
      tUnits: '0',
      courses: []
    },
    {
      tIndex: 1,
      tUnits: '14',
      courses: [
        {
          color: '#FEFD9A',
          id: 'AGC102'
        },
        {
          color: '#FEFD9A',
          id: 'JOUR205'
        },
        {
          color: '#FEFD9A',
          id: 'MATH118'
        },
        {
          color: '#DCFDD2',
          id: 'ENGL134'
        }
      ]
    },
    {
      tIndex: 2,
      tUnits: '14',
      courses: [
        {
          color: '#FEFD9A',
          id: 'AGC207'
        },
        {
          color: '#FEFD9A',
          id: 'AEPS120'
        },
        {
          color: '#FEFD9A',
          id: 'CHEM110'
        },
        {
          color: '#DCFDD2',
          id: 'COMS101'
        }
      ]
    },
    {
      tIndex: 3,
      tUnits: '16',
      courses: [
        {
          color: '#FEFD9A',
          id: 'AGB212'
        },
        {
          color: '#FEFD9A',
          id: 'ASCI112'
        },
        {
          color: '#FEFD9A',
          customDesc:
            'Select one course from: ASCI221, ASCI222, ASCI223, ASCI224, ASCI225; DSCI230.',
          customUnits: '4',
          id: null,
          customId: 'Animal Science Course'
        },
        {
          color: '#DCFDD2',
          id: 'COMS126'
        }
      ]
    },
    {
      tIndex: 5,
      tUnits: '16',
      courses: [
        {
          color: '#FEFD9A',
          id: 'JOUR203'
        },
        {
          color: '#FEFD9A',
          customDesc: 'Choose one of the following: BIO111, BIO161.',
          customUnits: '4',
          id: null,
          customId: 'Choose One',
          customDisplayName: 'BIO111, BIO161'
        },
        {
          color: '#FEFD9A',
          id: 'FSN275'
        },
        {
          color: '#DCFDD2',
          customDesc:
            'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
          customUnits: '4',
          id: null,
          customId: 'GE'
        }
      ]
    },
    {
      tIndex: 6,
      tUnits: '16',
      courses: [
        {
          color: '#FEFD9A',
          id: 'ECON222'
        },
        {
          color: '#FEFD9A',
          id: 'FSN230'
        },
        {
          color: '#FEFD9A',
          id: 'AGC225'
        },
        {
          color: '#DCFDD2',
          customDesc:
            'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
          customUnits: '4',
          id: null,
          customId: 'GE'
        }
      ]
    },
    {
      tIndex: 7,
      tUnits: '16',
      courses: [
        {
          color: '#FEFD9A',
          id: 'AGB260'
        },
        {
          color: '#FEFD9A',
          customDesc: 'Choose one of the following: STAT217, STAT218.',
          customUnits: '4',
          id: null,
          customId: 'Choose One',
          customDisplayName: 'STAT217, STAT218'
        },
        {
          color: '#FEFD9A',
          customDesc: 'Choose one of the following: SS120, SS130.',
          customUnits: '4',
          id: null,
          customId: 'Choose One',
          customDisplayName: 'SS120, SS130'
        },
        {
          color: '#DCFDD2',
          customDesc:
            'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
          customUnits: '4',
          id: null,
          customId: 'GE'
        }
      ]
    },
    {
      tIndex: 9,
      tUnits: '14-15',
      courses: [
        {
          color: '#FEFD9A',
          id: 'ENGL310'
        },
        {
          color: '#FEFD9A',
          customDesc: 'Choose one of the following: AGC425, GRC377, JOUR390.',
          customUnits: '4',
          id: null,
          customId: 'Media',
          customDisplayName: 'AGC425, GRC377, JOUR390'
        },
        {
          color: '#FEFD9A',
          customDesc: 'Choose one of the following: BRAE121, BRAE141.',
          customUnits: '2-3',
          id: null,
          customId: 'Choose One',
          customDisplayName: 'BRAE121, BRAE141'
        },
        {
          color: '#DCFDD2',
          customDesc:
            'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
          customUnits: '4',
          id: null,
          customId: 'GE'
        }
      ]
    },
    {
      tIndex: 10,
      tUnits: '16',
      courses: [
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
          customUnits: '4',
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
      ]
    },
    {
      tIndex: 11,
      tUnits: '16',
      courses: [
        {
          color: '#FEFD9A',
          id: 'BRAE340'
        },
        {
          color: '#FEFD9A',
          id: 'AGB312'
        },
        {
          color: '#FEFD9A',
          customDesc: 'Choose one of the following: NR308/ES308, NR323.',
          customUnits: '4',
          id: null,
          customId: 'Choose One',
          customDisplayName: 'NR308, NR323'
        },
        {
          color: '#DCFDD2',
          customDesc:
            'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
          customUnits: '4',
          id: null,
          customId: 'GE'
        }
      ]
    },
    {
      tIndex: 13,
      tUnits: '13',
      courses: [
        {
          color: '#FEFD9A',
          customDesc: 'Choose one of the following: AGC339, AG339.',
          customUnits: '4',
          id: null,
          customId: 'Internship in Agriculture',
          customDisplayName: 'AGC339, AG339'
        },
        {
          color: '#FEFD9A',
          customDesc: 'Choose one of the following: AEPS329, AG452, AGC452.',
          customUnits: '4',
          id: null,
          customId: 'Agricultural Issues',
          customDisplayName: 'AEPS329, AG452, AGC452'
        },
        {
          color: '#FEFD9A',
          id: 'AGC460'
        },
        {
          color: '#FEFD9A',
          id: 'AGC426'
        }
      ]
    },
    {
      tIndex: 14,
      // intentionally large so we can differentiate between fullCompute state
      tUnits: '20',
      courses: [
        {
          color: '#FEFD9A',
          customDesc: 'Choose one of the following: AGC461, AGED461.',
          customUnits: '1',
          id: null,
          customId: 'Senior Project I',
          customDisplayName: 'AGC461, AGED461'
        },
        {
          color: '#FEFD9A',
          id: 'AGC404'
        },
        {
          color: '#FEFD9A',
          id: 'COMS316'
        },
        {
          color: '#FEFD9A',
          id: 'AGC407'
        },
        {
          color: '#DCFDD2',
          customDesc:
            'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
          customUnits: '4',
          id: null,
          customId: 'GE'
        }
      ]
    },
    {
      tIndex: 15,
      tUnits: '12-13',
      courses: [
        {
          color: '#FEFD9A',
          customDesc: 'Choose one of the following: AGC462, AGED462',
          customUnits: '1',
          id: null,
          customId: 'Senior Project II',
          customDisplayName: 'AGC462, AGED462'
        },
        {
          color: '#FEFD9A',
          id: 'AGC475'
        },
        {
          color: '#DCFDD2',
          customDesc:
            'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
          customUnits: '4',
          id: null,
          customId: 'GE'
        },
        {
          color: '#D4FFFE',
          customDesc: 'Any Free Elective course can go here.',
          customUnits: '3-4',
          id: null,
          customId: 'Free Elective'
        }
      ]
    }
  ];

  test('compute total units for empty flowchart', () => {
    expect(computeTotalUnits([], [], [])).toBe('0');
  });

  test('compute total units for standard flowchart, no fullCompute', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2021-2022'
    );
    expect(computeTotalUnits(flowTermData, courseCache, apiDataConfig.apiData.programData)).toBe(
      '183-185'
    );
  });

  test('compute total units for standard flowchart, fullCompute no programId', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2021-2022'
    );

    expect(() =>
      computeTotalUnits(flowTermData, courseCache, apiDataConfig.apiData.programData, true)
    ).toThrowError('computeTotalUnits: requested fullCompute with no programId');
  });

  test('compute total units for standard flowchart, fullCompute with programId', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2021-2022'
    );

    expect(
      computeTotalUnits(flowTermData, courseCache, apiDataConfig.apiData.programData, true, [
        'fd2f33be-3103-4b3d-a17b-94ced0d7998f'
      ])
    ).toBe('179-181');
  });
});
