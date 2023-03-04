import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { generateFlowHash, mergeFlowchartsCourseData } from '$lib/common/util/flowDataUtilCommon';
import type { CourseCache } from '$lib/types';
import type { Flowchart, Term } from '$lib/common/schema/flowchartSchema';

// init API data
await apiDataConfig.init();

describe('generateFlowHash tests', () => {
  test('hash works', () => {
    const flow1: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: '',
      notes: '',
      ownerId: '',
      programId: [''],
      startYear: '',
      termData: [],
      unitTotal: '',
      version: 7,
      importedId: null,
      publishedId: null
    };
    expect(generateFlowHash(flow1)).toBe(
      'fe16d77876a4bf219b30edcf94e7eea3.38197c976d620a5d6a5cb79a6bbb9d7c'
    );
  });

  test('different ordering of properties result in same hash', () => {
    const flow1: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: '',
      notes: '',
      ownerId: '',
      programId: [''],
      startYear: '',
      termData: [],
      unitTotal: '',
      version: 7,
      importedId: null,
      publishedId: null
    };

    const flow2: Flowchart = {
      hash: '',
      id: '',
      ownerId: '',
      publishedId: null,
      name: '',
      termData: [],
      importedId: null,
      notes: '',
      programId: [''],
      startYear: '',
      lastUpdatedUTC: new Date(),
      unitTotal: '',
      version: 7
    };
    expect(generateFlowHash(flow1)).toBe(
      'fe16d77876a4bf219b30edcf94e7eea3.38197c976d620a5d6a5cb79a6bbb9d7c'
    );
    expect(generateFlowHash(flow2)).toBe(
      'fe16d77876a4bf219b30edcf94e7eea3.38197c976d620a5d6a5cb79a6bbb9d7c'
    );
  });

  test('different flows have different metadata but same content', () => {
    const flow1: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: 'name1',
      notes: '',
      ownerId: '',
      programId: ['dfdfd'],
      startYear: '',
      termData: [],
      unitTotal: '',
      version: 7,
      importedId: null,
      publishedId: null
    };

    const flow2: Flowchart = {
      hash: '',
      id: '',
      ownerId: '',
      publishedId: null,
      name: 'name2',
      termData: [],
      importedId: null,
      notes: '',
      programId: ['weweww'],
      startYear: '',
      lastUpdatedUTC: new Date(),
      unitTotal: '',
      version: 7
    };

    const flowHash1Parts = generateFlowHash(flow1).split('.');
    const flowHash2Parts = generateFlowHash(flow2).split('.');

    expect(generateFlowHash(flow1)).not.toBe(generateFlowHash(flow2));
    expect(flowHash1Parts[0]).not.toBe(flowHash2Parts[0]);
    expect(flowHash1Parts[1]).toBe(flowHash2Parts[1]);
  });

  test('different flows have same metadata but different content', () => {
    const flow1: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: '',
      notes: '',
      ownerId: '',
      programId: [''],
      startYear: '',
      termData: [
        {
          tIndex: 1,
          tUnits: '0',
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
            }
          ]
        }
      ],
      unitTotal: '',
      version: 7,
      importedId: null,
      publishedId: null
    };
    const flow2: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: '',
      notes: '',
      ownerId: '',
      programId: [''],
      startYear: '',
      termData: [
        {
          tIndex: 1,
          tUnits: '0',
          courses: [
            {
              color: '#FEFD9A',
              id: 'AGC301'
            },
            {
              color: '#FEFD9A',
              id: 'JOUR312'
            }
          ]
        }
      ],
      unitTotal: '',
      version: 7,
      importedId: null,
      publishedId: null
    };

    const flowHash1Parts = generateFlowHash(flow1).split('.');
    const flowHash2Parts = generateFlowHash(flow2).split('.');

    expect(generateFlowHash(flow1)).not.toBe(generateFlowHash(flow2));
    expect(flowHash1Parts[0]).toBe(flowHash2Parts[0]);
    expect(flowHash1Parts[1]).not.toBe(flowHash2Parts[1]);
  });

  test('two different flows (different content and metadata) have different hashes', () => {
    const flow1: Flowchart = {
      hash: '',
      id: 'rytntryntrbfd',
      lastUpdatedUTC: new Date(),
      name: 'dfdfdd',
      notes: 'wefewfvewvdsv',
      ownerId: 'sds',
      programId: [''],
      startYear: '',
      termData: [
        {
          tIndex: 1,
          tUnits: '0',
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
            }
          ]
        }
      ],
      unitTotal: '',
      version: 7,
      importedId: null,
      publishedId: null
    };
    const flow2: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: '',
      notes: '',
      ownerId: '',
      programId: [''],
      startYear: '',
      termData: [
        {
          tIndex: 1,
          tUnits: '0',
          courses: [
            {
              color: '#FEFD9A',
              id: 'AGC301'
            },
            {
              color: '#FEFD9A',
              id: 'JOUR312'
            }
          ]
        }
      ],
      unitTotal: '',
      version: 7,
      importedId: null,
      publishedId: null
    };

    const flowHash1Parts = generateFlowHash(flow1).split('.');
    const flowHash2Parts = generateFlowHash(flow2).split('.');

    expect(generateFlowHash(flow1)).not.toBe(generateFlowHash(flow2));
    expect(flowHash1Parts[0]).not.toBe(flowHash2Parts[0]);
    expect(flowHash1Parts[1]).not.toBe(flowHash2Parts[1]);
  });
});

describe('mergeFlowchartsCourseData tests', () => {
  test('merging with empty data', () => {
    expect(mergeFlowchartsCourseData([], [], [], [])).toEqual([]);
  });

  test('merge single flowchart data', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2015-2017'
    );
    const flow1TermData: Term[] = [
      {
        tIndex: 1,
        tUnits: '12',
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
          }
        ]
      }
    ];

    expect(
      mergeFlowchartsCourseData(
        [flow1TermData],
        ['68be11b7-389b-4ebc-9b95-8997e7314497'],
        courseCache,
        apiDataConfig.apiData.programData
      )
    ).toEqual(flow1TermData);
  });

  test('merge two flowcharts data with courseMerge set', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2015-2017' || crsData.catalog === '2022-2026'
    );
    const flow1TermData: Term[] = [
      {
        tIndex: 1,
        tUnits: '12',
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
          }
        ]
      }
    ];

    const flow2TermData: Term[] = [
      {
        tIndex: 1,
        tUnits: '13-15',
        courses: [
          {
            color: '#FEFD9A',
            id: 'AGC301'
          },
          {
            color: '#FEFD9A',
            id: 'KINE134'
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
        ]
      }
    ];

    const combinedFlowDataMerged: Term[] = [
      {
        tIndex: 1,
        tUnits: '17-19',
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
            color: '#FEFD9A',
            id: 'KINE134',
            programIdIndex: 1
          },
          {
            color: '#DCFDD2',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
            customUnits: '4-6',
            id: null,
            customId: 'GE',
            programIdIndex: 1
          },
          {
            color: '#DA9593',
            customDesc:
              'Students can attempt to fulfill the requirement after 90 earned units; students should complete the requirement before senior year. Refer to current catalog for prerequisites. Any GWR class or GWR exam can go here.',
            id: null,
            customId: 'Graduation Writing Requirement',
            programIdIndex: 1
          }
        ]
      }
    ];

    expect(
      mergeFlowchartsCourseData(
        [flow1TermData, flow2TermData],
        ['68be11b7-389b-4ebc-9b95-8997e7314497', 'cb65784d-23d6-44a9-ae7a-03b4b50d5b36'],
        courseCache,
        apiDataConfig.apiData.programData
      )
    ).toEqual(combinedFlowDataMerged);
  });

  test('merge 2 w/ courseMerge OFF', () => {
    const courseCache: CourseCache[] = apiDataConfig.apiData.courseData.filter(
      (crsData) => crsData.catalog === '2015-2017' || crsData.catalog === '2022-2026'
    );
    const flow1TermData: Term[] = [
      {
        tIndex: 1,
        tUnits: '12',
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
          }
        ]
      }
    ];

    const flow2TermData: Term[] = [
      {
        tIndex: 1,
        tUnits: '13-15',
        courses: [
          {
            color: '#FEFD9A',
            id: 'AGC301'
          },
          {
            color: '#FEFD9A',
            id: 'KINE134'
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
        ]
      }
    ];

    const combinedFlowDataMerged: Term[] = [
      {
        tIndex: 1,
        tUnits: '25-27',
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
            color: '#FEFD9A',
            id: 'AGC301',
            programIdIndex: 1
          },
          {
            color: '#FEFD9A',
            id: 'KINE134',
            programIdIndex: 1
          },
          {
            color: '#FEFD9A',
            id: 'JOUR312',
            programIdIndex: 1
          },
          {
            color: '#DCFDD2',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, C1, C2, Lower-Division C, Upper-Division C, D1, E, F, and GE Elective. Upper-Division C should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP), and Graduation Writing Requirement (GWR) requirements.',
            customUnits: '4-6',
            id: null,
            customId: 'GE',
            programIdIndex: 1
          },
          {
            color: '#DA9593',
            customDesc:
              'Students can attempt to fulfill the requirement after 90 earned units; students should complete the requirement before senior year. Refer to current catalog for prerequisites. Any GWR class or GWR exam can go here.',
            id: null,
            customId: 'Graduation Writing Requirement',
            programIdIndex: 1
          }
        ]
      }
    ];

    expect(
      mergeFlowchartsCourseData(
        [flow1TermData, flow2TermData],
        ['68be11b7-389b-4ebc-9b95-8997e7314497', 'cb65784d-23d6-44a9-ae7a-03b4b50d5b36'],
        courseCache,
        apiDataConfig.apiData.programData,
        false
      )
    ).toEqual(combinedFlowDataMerged);
  });
});
