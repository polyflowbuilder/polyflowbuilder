import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import { computeGroupUnits } from '$lib/client/util/unitCounterUtilClient';
import { CURRENT_FLOW_DATA_VERSION } from '$lib/common/config/flowDataConfig';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

// init api data
await apiDataConfig.init();

// TODO: add tests for multiple programs

describe('computeGroupUnits tests', () => {
  const flowchartSingleProgram: Flowchart = {
    hash: '',
    id: '',
    lastUpdatedUTC: new Date(),
    name: '',
    notes: '',
    ownerId: '',
    programId: ['68be11b7-389b-4ebc-9b95-8997e7314497'],
    startYear: '',
    unitTotal: '500', // just a test value
    version: CURRENT_FLOW_DATA_VERSION,
    importedId: null,
    publishedId: null,
    termData: [
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
    ]
  };

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

    expect(computeGroupUnits(null, [], [])).toStrictEqual(expectedCounts);
  });

  test('standard flowchart, 1 program', () => {
    const expectedCounts = {
      major: '118-119',
      support: '0',
      conc1: '0',
      conc2: '0',
      ge: '44',
      elective: '3-4',
      other: '0',
      total: '500'
    };

    expect(
      computeGroupUnits(
        flowchartSingleProgram,
        apiDataConfig.apiData.courseData,
        apiDataConfig.apiData.programData
      )
    ).toStrictEqual(expectedCounts);
  });

  test('error thrown when unable to find catalog for course', () => {
    expect(() => {
      computeGroupUnits(flowchartSingleProgram, [], []);
    }).toThrowError('could not find catalog for course in flowchart');
  });
});
