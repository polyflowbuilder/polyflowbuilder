import { CURRENT_FLOW_DATA_VERSION } from '$lib/common/config/flowDataConfig';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

// TODO: consolidate these with populateFlowcharts?

export const TEST_FLOWCHART_SINGLE_PROGRAM_1: Flowchart = {
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
      tUnits: '24',
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
        },
        {
          id: 'CPE101',
          color: '#FFFFFF',
          customUnits: '8'
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
      tUnits: '21',
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
          color: '#FFFFFF',
          id: 'CPE100',
          customUnits: '5'
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

export const TEST_FLOWCHART_SINGLE_PROGRAM_2: Flowchart = {
  id: '118d3c00-541b-411d-8e8c-2e55bc5948fd',
  ownerId: 'ebee4558-4c2f-4b6a-8d87-77b8e5eae39e',
  name: 'TEST_FLOWCHART_NAME',
  startYear: '2017',
  unitTotal: '76',
  notes: '',
  termData: [
    {
      tIndex: -1,
      tUnits: '0',
      courses: []
    },
    {
      tIndex: 25,
      tUnits: '17',
      courses: [
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        },
        {
          id: 'MATH142',
          color: '#FFFFFF'
        },
        {
          id: 'MATH153',
          color: '#FFFFFF'
        },
        {
          id: 'MATH96',
          color: '#FFFFFF'
        },
        {
          id: 'MATH112',
          color: '#FFFFFF'
        }
      ]
    },
    {
      tIndex: 26,
      tUnits: '45',
      courses: [
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'longestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlongestlon',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        },
        {
          id: 'MATH151',
          color: '#FFFFFF'
        },
        {
          id: 'MATH118',
          color: '#FFFFFF'
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        },
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe'
        }
      ]
    },
    {
      tIndex: 27,
      tUnits: '14',
      courses: [
        {
          id: null,
          color: '#FFFFFF',
          customId:
            'this is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
          customUnits: '5',
          customDisplayName:
            'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice '
        },
        {
          id: 'MATH116',
          color: '#FFFFFF'
        },
        {
          id: 'MATH126',
          color: '#FFFFFF'
        },
        {
          id: 'MATH128',
          color: '#FFFFFF'
        },
        {
          id: 'MATH141',
          color: '#FFFFFF'
        }
      ]
    }
  ],
  version: CURRENT_FLOW_DATA_VERSION,
  hash: 'c77ca499708c3890ecf5b7e7556df944.f660f328881ca3bbb89ce6247ba08bfc',
  publishedId: null,
  importedId: null,
  lastUpdatedUTC: new Date(),
  programId: ['4fc5d3c2-f5a7-4074-ae3d-5b3e01cb1168']
};
