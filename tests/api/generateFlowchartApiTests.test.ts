import crypto from 'crypto';
import { expect, test } from '@playwright/test';
import { performLoginBackend } from '../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { flowchartValidationSchema } from '$lib/common/schema/flowchartSchema';
import { CURRENT_FLOW_DATA_VERSION, FLOW_NAME_MAX_LENGTH } from '$lib/common/config/flowDataConfig';
import { cloneAndDeleteNestedProperty, deleteObjectProperties } from '../util/testUtil.js';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types/apiDataTypes.js';

const GENERATE_FLOWCHART_TESTS_API_1_EMAIL =
  'pfb_test_generateFlowchartAPI_inputs_playwright@test.com';
const GENERATE_FLOWCHART_TESTS_API_2_EMAIL =
  'pfb_test_generateFlowchartAPI_outputs_playwright@test.com';

// TODO: move responsePayload1 and responsePayload2 to testFlowcharts.ts?

// see API for expected return type
interface GenerateFlowchartExpectedReturnType {
  message: string;
  generatedFlowchart: Flowchart;
  courseCache: CourseCache[] | undefined;
}

const responsePayload1 = {
  generatedFlowchart: {
    name: 'test',
    programId: ['68be11b7-389b-4ebc-9b95-8997e7314497'],
    startYear: '2020',
    termData: [
      {
        tIndex: -1,
        tUnits: '0',
        courses: []
      },
      {
        tIndex: 1,
        tUnits: '18',
        courses: [
          {
            id: 'AERO121',
            color: '#FEFD9A'
          },
          {
            id: 'MATH141',
            color: '#FCD09E'
          },
          {
            id: 'IME144',
            color: '#FCD09E'
          },
          {
            id: 'ENGL134',
            color: '#DCFDD2'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          }
        ]
      },
      {
        tIndex: 2,
        tUnits: '16',
        courses: [
          {
            id: 'CHEM124',
            color: '#FCD09E'
          },
          {
            id: 'MATH142',
            color: '#FCD09E'
          },
          {
            id: null,
            color: '#FCD09E',
            customId: 'General Physics',
            customDesc: 'Choose one of the following: PHYS131, PHYS141.',
            customUnits: '4',
            customDisplayName: 'PHYS131 or PHYS141'
          },
          {
            id: 'COMS101',
            color: '#DCFDD2'
          }
        ]
      },
      {
        tIndex: 3,
        tUnits: '16',
        courses: [
          {
            id: 'PHYS132',
            color: '#FCD09E'
          },
          {
            id: 'MATH143',
            color: '#FCD09E'
          },
          {
            id: 'ENGL149',
            color: '#FCD09E'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          }
        ]
      },
      {
        tIndex: 5,
        tUnits: '17',
        courses: [
          {
            id: 'AERO215',
            color: '#FEFD9A'
          },
          {
            id: 'MATH241',
            color: '#FCD09E'
          },
          {
            id: 'ME211',
            color: '#FCD09E'
          },
          {
            id: 'PHYS133',
            color: '#FCD09E'
          },
          {
            id: 'BIO213',
            color: '#FCD09E'
          },
          {
            id: 'BMED213',
            color: '#FCD09E'
          }
        ]
      },
      {
        tIndex: 6,
        tUnits: '17',
        courses: [
          {
            id: 'MATE210',
            color: '#FCD09E'
          },
          {
            id: 'ME212',
            color: '#FCD09E'
          },
          {
            id: 'MATH244',
            color: '#FCD09E'
          },
          {
            id: 'CE204',
            color: '#FEFD9A'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          }
        ]
      },
      {
        tIndex: 7,
        tUnits: '15',
        courses: [
          {
            id: 'AERO301',
            color: '#FEFD9A'
          },
          {
            id: 'AERO300',
            color: '#FEFD9A'
          },
          {
            id: 'STAT312',
            color: '#FCD09E'
          },
          {
            id: 'CE207',
            color: '#FEFD9A'
          }
        ]
      },
      {
        tIndex: 9,
        tUnits: '16',
        courses: [
          {
            id: 'AERO302',
            color: '#FEFD9A'
          },
          {
            id: 'AERO306',
            color: '#F9A3D2'
          },
          {
            id: 'EE201',
            color: '#FEFD9A'
          },
          {
            id: 'EE251',
            color: '#FEFD9A'
          },
          {
            id: 'AERO320',
            color: '#FEFD9A'
          }
        ]
      },
      {
        tIndex: 10,
        tUnits: '14',
        courses: [
          {
            id: 'AERO303',
            color: '#FEFD9A'
          },
          {
            id: 'AERO304',
            color: '#FEFD9A'
          },
          {
            id: 'AERO331',
            color: '#FEFD9A'
          },
          {
            id: 'AERO420',
            color: '#F9A3D2'
          },
          {
            id: null,
            color: '#DA9593',
            customId: 'Graduation Writing Requirement',
            customDesc:
              'Students can attempt to fulfill the requirement after 90 earned units; students should complete the requirement before senior year. Any GWR class or GWR exam can go here. Refer to current catalog for prerequisites.\n'
          }
        ]
      },
      {
        tIndex: 11,
        tUnits: '18',
        courses: [
          {
            id: 'AERO307',
            color: '#F9A3D2'
          },
          {
            id: 'AERO405',
            color: '#F9A3D2'
          },
          {
            id: 'AERO431',
            color: '#FEFD9A'
          },
          {
            id: null,
            color: '#F9A3D2',
            customId: 'Aeronautics Approved Electives',
            customDesc:
              'Any Aeronautics Approved Electives can go here. Consultation with advisor is recommended prior to selecting approved courses; bear in mind your selections may impact pursuit of postbaccalaureate studies and/or goals.',
            customUnits: '4'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          }
        ]
      },
      {
        tIndex: 13,
        tUnits: '15',
        courses: [
          {
            id: 'AERO401',
            color: '#F9A3D2'
          },
          {
            id: 'AERO443',
            color: '#F9A3D2'
          },
          {
            id: 'AERO433',
            color: '#FEFD9A'
          },
          {
            id: 'AERO460',
            color: '#FEFD9A'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          }
        ]
      },
      {
        tIndex: 14,
        tUnits: '12',
        courses: [
          {
            id: null,
            color: '#F9A3D2',
            customId: 'Aeronautics Approved Electives',
            customDesc:
              'Any Aeronautics Approved Electives can go here. Consultation with advisor is recommended prior to selecting approved courses; bear in mind your selections may impact pursuit of postbaccalaureate studies and/or goals.',
            customUnits: '4'
          },
          {
            id: 'AERO444',
            color: '#F9A3D2'
          },
          {
            id: 'AERO465',
            color: '#FEFD9A'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          }
        ]
      },
      {
        tIndex: 15,
        tUnits: '15',
        courses: [
          {
            id: null,
            color: '#F9A3D2',
            customId: 'Aeronautics Approved Electives',
            customDesc:
              'Any Aeronautics Approved Electives can go here. Consultation with advisor is recommended prior to selecting approved courses; bear in mind your selections may impact pursuit of postbaccalaureate studies and/or goals.',
            customUnits: '4'
          },
          {
            id: 'AERO445',
            color: '#F9A3D2'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          }
        ]
      }
    ],
    unitTotal: '189',
    notes: '',
    version: CURRENT_FLOW_DATA_VERSION,
    publishedId: null,
    importedId: null
  },
  generatedFlowchartNoGE: {
    name: 'test',
    programId: ['68be11b7-389b-4ebc-9b95-8997e7314497'],
    startYear: '2020',
    termData: [
      {
        tIndex: -1,
        tUnits: '0',
        courses: []
      },
      {
        tIndex: 1,
        tUnits: '10',
        courses: [
          {
            id: 'AERO121',
            color: '#FEFD9A'
          },
          {
            id: 'MATH141',
            color: '#FCD09E'
          },
          {
            id: 'IME144',
            color: '#FCD09E'
          }
        ]
      },
      {
        tIndex: 2,
        tUnits: '12',
        courses: [
          {
            id: 'CHEM124',
            color: '#FCD09E'
          },
          {
            id: 'MATH142',
            color: '#FCD09E'
          },
          {
            id: null,
            color: '#FCD09E',
            customId: 'General Physics',
            customDesc: 'Choose one of the following: PHYS131, PHYS141.',
            customUnits: '4',
            customDisplayName: 'PHYS131 or PHYS141'
          }
        ]
      },
      {
        tIndex: 3,
        tUnits: '12',
        courses: [
          {
            id: 'PHYS132',
            color: '#FCD09E'
          },
          {
            id: 'MATH143',
            color: '#FCD09E'
          },
          {
            id: 'ENGL149',
            color: '#FCD09E'
          }
        ]
      },
      {
        tIndex: 5,
        tUnits: '17',
        courses: [
          {
            id: 'AERO215',
            color: '#FEFD9A'
          },
          {
            id: 'MATH241',
            color: '#FCD09E'
          },
          {
            id: 'ME211',
            color: '#FCD09E'
          },
          {
            id: 'PHYS133',
            color: '#FCD09E'
          },
          {
            id: 'BIO213',
            color: '#FCD09E'
          },
          {
            id: 'BMED213',
            color: '#FCD09E'
          }
        ]
      },
      {
        tIndex: 6,
        tUnits: '13',
        courses: [
          {
            id: 'MATE210',
            color: '#FCD09E'
          },
          {
            id: 'ME212',
            color: '#FCD09E'
          },
          {
            id: 'MATH244',
            color: '#FCD09E'
          },
          {
            id: 'CE204',
            color: '#FEFD9A'
          }
        ]
      },
      {
        tIndex: 7,
        tUnits: '15',
        courses: [
          {
            id: 'AERO301',
            color: '#FEFD9A'
          },
          {
            id: 'AERO300',
            color: '#FEFD9A'
          },
          {
            id: 'STAT312',
            color: '#FCD09E'
          },
          {
            id: 'CE207',
            color: '#FEFD9A'
          }
        ]
      },
      {
        tIndex: 9,
        tUnits: '16',
        courses: [
          {
            id: 'AERO302',
            color: '#FEFD9A'
          },
          {
            id: 'AERO306',
            color: '#F9A3D2'
          },
          {
            id: 'EE201',
            color: '#FEFD9A'
          },
          {
            id: 'EE251',
            color: '#FEFD9A'
          },
          {
            id: 'AERO320',
            color: '#FEFD9A'
          }
        ]
      },
      {
        tIndex: 10,
        tUnits: '14',
        courses: [
          {
            id: 'AERO303',
            color: '#FEFD9A'
          },
          {
            id: 'AERO304',
            color: '#FEFD9A'
          },
          {
            id: 'AERO331',
            color: '#FEFD9A'
          },
          {
            id: 'AERO420',
            color: '#F9A3D2'
          },
          {
            id: null,
            color: '#DA9593',
            customId: 'Graduation Writing Requirement',
            customDesc:
              'Students can attempt to fulfill the requirement after 90 earned units; students should complete the requirement before senior year. Any GWR class or GWR exam can go here. Refer to current catalog for prerequisites.\n'
          }
        ]
      },
      {
        tIndex: 11,
        tUnits: '14',
        courses: [
          {
            id: 'AERO307',
            color: '#F9A3D2'
          },
          {
            id: 'AERO405',
            color: '#F9A3D2'
          },
          {
            id: 'AERO431',
            color: '#FEFD9A'
          },
          {
            id: null,
            color: '#F9A3D2',
            customId: 'Aeronautics Approved Electives',
            customDesc:
              'Any Aeronautics Approved Electives can go here. Consultation with advisor is recommended prior to selecting approved courses; bear in mind your selections may impact pursuit of postbaccalaureate studies and/or goals.',
            customUnits: '4'
          }
        ]
      },
      {
        tIndex: 13,
        tUnits: '11',
        courses: [
          {
            id: 'AERO401',
            color: '#F9A3D2'
          },
          {
            id: 'AERO443',
            color: '#F9A3D2'
          },
          {
            id: 'AERO433',
            color: '#FEFD9A'
          },
          {
            id: 'AERO460',
            color: '#FEFD9A'
          }
        ]
      },
      {
        tIndex: 14,
        tUnits: '8',
        courses: [
          {
            id: null,
            color: '#F9A3D2',
            customId: 'Aeronautics Approved Electives',
            customDesc:
              'Any Aeronautics Approved Electives can go here. Consultation with advisor is recommended prior to selecting approved courses; bear in mind your selections may impact pursuit of postbaccalaureate studies and/or goals.',
            customUnits: '4'
          },
          {
            id: 'AERO444',
            color: '#F9A3D2'
          },
          {
            id: 'AERO465',
            color: '#FEFD9A'
          }
        ]
      },
      {
        tIndex: 15,
        tUnits: '7',
        courses: [
          {
            id: null,
            color: '#F9A3D2',
            customId: 'Aeronautics Approved Electives',
            customDesc:
              'Any Aeronautics Approved Electives can go here. Consultation with advisor is recommended prior to selecting approved courses; bear in mind your selections may impact pursuit of postbaccalaureate studies and/or goals.',
            customUnits: '4'
          },
          {
            id: 'AERO445',
            color: '#F9A3D2'
          }
        ]
      }
    ],
    unitTotal: '149',
    notes: '',
    version: CURRENT_FLOW_DATA_VERSION,
    publishedId: null,
    importedId: null
  },
  courseCache: [
    {
      catalog: '2015-2017',
      courses: [
        {
          id: 'AERO121',
          catalog: '2015-2017',
          displayName: 'Aerospace Fundamentals',
          units: '2',
          desc: 'Introduction to the engineering profession including the aeronautical and aerospace fields. Engineering approach to problem-solving and analysis of data obtained from experiments. Basic nomenclature and design criteria used in the aerospace industry. Applications to basic problems in the field. 1 lecture, 1 laboratory.\n',
          addl: 'Term Typically Offered: F\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATH141',
          catalog: '2015-2017',
          displayName: 'Calculus I',
          units: '4',
          desc: 'Limits, continuity, differentiation.  Introduction to integration.  4 lectures.  Crosslisted as HNRS/MATH 141.  Fulfills GE B1; for students admitted Fall 2016 or later, a grade of C- or better in one GE B1 course is required to fulfill GE Area B.\n',
          addl: 'GE Area B1\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: Completion of ELM requirement and passing score on appropriate Mathematics Placement Examination, or MATH 118 and high school trigonometry, or MATH 119.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'IME144',
          catalog: '2015-2017',
          displayName: 'Introduction to Design and Manufacturing',
          units: '4',
          desc: 'Supplemental review of visualization, sketching, and drafting fundamentals.  Computer-aided solid modeling of parts and assemblies.  Introduction to conventional machining processes on lathes and mills, computer numerical control, quality control, production methods, and design for manufacturing.  Open to all majors.  2 lectures, 2 laboratories.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nRecommended: IME 140 or ME 129 (Formerly ME 151).\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'ENGL134',
          catalog: '2015-2017',
          displayName: 'Writing and Rhetoric',
          units: '4',
          desc: 'Rhetorical principles and tactics applied to written work.  Writing as a recursive process that leads to greater organizational coherency, stylistic complexity, and rhetorical awareness.  4 lectures.  Fulfills GE A1; for students admitted Fall 2016 or later a grade of C- or better is required to fulfill GE Area A1.\n',
          addl: 'GE Area A1\nTerm Typically Offered: F, W, SP\nPrerequisite: Satisfactory score on the English Placement Test.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM124',
          catalog: '2015-2017',
          displayName: 'General Chemistry for Physical Science and Engineering I',
          units: '4',
          desc: 'Stoichiometry, thermochemistry, atomic structure, bonding, solid-state structures, intermolecular forces, and foundational principles of organic chemistry.  Not open to students with credit in CHEM 127.  Credit will be granted in only one of the following courses:  CHEM 110, CHEM 111, CHEM 124.  3 lectures, 1 laboratory.  Fulfills GE B3 & B4.\n',
          addl: 'GE Area B4; GE Area B3\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: Passing score on ELM, or an ELM exemption, or credit in MATH 104. Recommended: High school chemistry or equivalent.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATH142',
          catalog: '2015-2017',
          displayName: 'Calculus II',
          units: '4',
          desc: 'Techniques of integration, applications to physics, transcendental functions.  4 lectures.  Crosslisted as HNRS/MATH 142.  Fulfills GE B1; for students admitted Fall 2016 or later, a grade of C- or better in one GE B1 course is required to fulfill GE Area B.\n',
          addl: 'GE Area B1\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: MATH 141 with a grade of C- or better or consent of instructor.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'COMS101',
          catalog: '2015-2017',
          displayName: 'Public Speaking',
          units: '4',
          desc: 'Introduction to the principles of public speaking. Practical experience in the development, presentation, and critical analysis of speeches to inform, to persuade, and to actuate. Not open to students with credit in COMS 102. 4 lectures. Crosslisted as COMS/HNRS 101. Fulfills GE A2; for students admitted Fall 2016 or later a grade of C- or better is required to fulfill GE Area A2.\n',
          addl: 'GE Area A2\nTerm Typically Offered: F,W,SP,SU\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'PHYS132',
          catalog: '2015-2017',
          displayName: 'General Physics II',
          units: '4',
          desc: 'Oscillations, waves in elastic media, sound waves.  Temperature, heat and the first law of thermodynamics.  Kinetic theory of matter, second law of thermodynamics.  Geometrical and physical optics.  3 lectures, 1 laboratory.  Crosslisted as HNRS/PHYS 132.  Fulfills GE B3 & B4.\n',
          addl: 'GE Area B3; GE Area B4\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: PHYS 131 or HNRS 131 or PHYS 141.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATH143',
          catalog: '2015-2017',
          displayName: 'Calculus III',
          units: '4',
          desc: 'Infinite sequences and series, vector algebra, curves.  4 lectures.  Crosslisted as HNRS/MATH 143.  Fulfills GE B1; for students admitted Fall 2016 or later, a grade of C- or better in one GE B1 course is required to fulfill GE Area B.\n',
          addl: 'GE Area B1\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: MATH 142 with a grade of C- or better or consent of instructor.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'ENGL149',
          catalog: '2015-2017',
          displayName: 'Technical Writing for Engineers',
          units: '4',
          desc: 'The principles of technical writing.  Discussion and application of rhetorical principles in technical environments.  Study of methods, resources and common formats used in corporate or research writing.  4 lectures.  Crosslisted as ENGL/HNRS 149.  Fulfills GE A3; for students admitted Fall 2016 or later a grade of C- or better is required to fulfill GE Area A3.\n',
          addl: 'GE Area A3\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: Completion of GE Area A1 with a C- or better, or consent of instructor; for Engineering students only. Recommended: Completion of GE Area A2.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO215',
          catalog: '2015-2017',
          displayName: 'Introduction to Aerospace Design',
          units: '2',
          desc: 'Introduction to problem solving techniques and team-centered design projects in aerospace engineering.  Primary emphasis on the solutions of design problems in aerospace engineering using computers.  2 laboratories.\n',
          addl: 'Term Typically Offered: F, W\nPrerequisite: AERO 121, MATH 143, and IME 144. Recommended: CSC 111.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATH241',
          catalog: '2015-2017',
          displayName: 'Calculus IV',
          units: '4',
          desc: 'Partial derivatives, multiple integrals, introduction to vector analysis.  4 lectures.  Crosslisted as HNRS/MATH 241.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: MATH 143.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'ME211',
          catalog: '2015-2017',
          displayName: 'Engineering Statics',
          units: '3',
          desc: 'Analysis of forces on engineering structures in equilibrium.  Properties of forces, moments, couples, and resultants.  Equilibrium conditions, friction, centroids, area moments of inertia.  Introduction to mathematical modeling and problem solving.  Vector mathematics where appropriate.  3 lectures.  Crosslisted as HNRS/ME 211.\n',
          addl: 'Term Typically Offered: F, W, SP\nPrerequisite: MATH 241 (or concurrently), PHYS 131 or PHYS 141.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'PHYS133',
          catalog: '2015-2017',
          displayName: 'General Physics III',
          units: '4',
          desc: 'Charge and matter, electric field, electric potential, dielectrics, capacitance, current and resistance, electromotive force and circuits, magnetic fields, magnetic field of a moving charge, induced emf.  3 lectures, 1 laboratory.  Fulfills GE B3 & B4.\n',
          addl: 'GE Area B3; GE Area B4\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: PHYS 131 or HNRS 131 or PHYS 141, and MATH 142. Recommended: MATH 241.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'BIO213',
          catalog: '2015-2017',
          displayName: 'Life Science for Engineers',
          units: '2',
          desc: 'Fundamentals of life sciences:  energetics, cell biology, molecular and classical genetics, microbiology, organismal biology, and ecology.  2 lectures.  Fulfills GE B2.\n',
          addl: 'GE Area B2\nTerm Typically Offered: F, W, SP\nPrerequisite: MATH 142; for engineering students only. Corequisite: BMED/BRAE 213. Recommended: CHEM 124.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'BMED213',
          catalog: '2015-2017',
          displayName: 'Bioengineering Fundamentals',
          units: '2',
          desc: 'Treatment of the engineering applications of biology.  Genetic engineering and the industrial application of microbiology.  Systems physiology with engineering applications.  Structure and function relationships in biological systems.  The impact of life on its environment.  2 lectures.  Crosslisted as BRAE/BMED 213.  Fulfills GE B2.  Formerly BRAE/ENGR 213.\n',
          addl: 'GE Area B2\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: MATH 142; for engineering students only. Corequisite: BIO 213. Recommended: CHEM 124.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATE210',
          catalog: '2015-2017',
          displayName: 'Materials Engineering',
          units: '3',
          desc: 'Structure of matter.  Physical and mechanical properties of materials including metals, polymers, ceramics, composites, and electronic materials.  Equilibrium diagrams.  Heat treatments, materials selection and corrosion phenomena.  3 lectures.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: CHEM 111 or CHEM 124 or CHEM 127. Recommended: Concurrent enrollment in MATE 215.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'ME212',
          catalog: '2015-2017',
          displayName: 'Engineering Dynamics',
          units: '3',
          desc: 'Analysis of motions of particles and rigid bodies encountered in engineering.  Velocity, acceleration, relative motion, work, energy, impulse, and momentum.  Further development of mathematical modeling and problem solving.  Vector mathematics where appropriate.  3 lectures.  Crosslisted as HNRS 214/ME 212.\n',
          addl: 'Term Typically Offered: F, W, SP\nPrerequisite: MATH 241; ME 211 or ARCE 211.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATH244',
          catalog: '2015-2017',
          displayName: 'Linear Analysis I',
          units: '4',
          desc: 'Separable and linear ordinary differential equations with selected applications; numerical and analytical solutions.  Linear algebra:  vectors in n-space, matrices, linear transformations, eigenvalues, eigenvectors, diagonalization; applications to the study of systems of linear differential equations.  4 lectures.  Crosslisted as HNRS/MATH 244.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: MATH 143.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CE204',
          catalog: '2015-2017',
          displayName: 'Mechanics of Materials I',
          units: '3',
          desc: 'Stresses, strains, and deformations associated with axial, torsional, and flexural loading of bars, shafts, and beams.  Analysis of elementary determinate and indeterminate mechanical and structural systems.  2 lectures, 1 activity.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: ME 211.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO301',
          catalog: '2015-2017',
          displayName: 'Aerothermodynamics I',
          units: '4',
          desc: 'Properties and characteristics of fluids, fluid statics and dynamics, the thermodynamic relations, laminar and turbulent flows, subsonic and supersonic flows as applied to flight vehicles.  Introduction to heat transfer.  4 lectures.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: ME 211. Corequisite: AERO 300.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO300',
          catalog: '2015-2017',
          displayName: 'Aerospace Engineering Analysis',
          units: '5',
          desc: 'Analytical methods for aerospace engineering problems.  Topics include vector calculus, linear algebra, differential equations, Laplace transforms and Fourier series.  Computer tools and numerical methods as applied to problems in aerodynamics, structures, stability and control and astronautics.  4 lectures, 1 laboratory.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: AERO 215, MATH 244, ME 211, and PHYS 133.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'STAT312',
          catalog: '2015-2017',
          displayName: 'Statistical Methods for Engineers',
          units: '4',
          desc: 'Descriptive and graphical methods.  Discrete and continuous probability distributions.  One and two sample confidence intervals and hypothesis testing.  Single factor analysis of variance.  Quality control.  Introduction to regression and to experimental design.  Substantial use of statistical software.  4 lectures.  Fulfills GE B6.\n',
          addl: 'GE Area B6\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: MATH 142.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CE207',
          catalog: '2015-2017',
          displayName: 'Mechanics of Materials II',
          units: '2',
          desc: 'Combined stress states including torsion, axial, shear, moment, and pressure vessel loadings.  Principle stress/strain states.  Basic failure criteria.  Analysis of beam forces, moments, deflections, and rotations.  Introduction to stability concepts including column buckling.  1 lecture, 1 activity.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: CE 204.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO302',
          catalog: '2015-2017',
          displayName: 'Aerothermodynamics II',
          units: '4',
          desc: 'Properties and characteristics of fluids, fluid statics and dynamics, the thermodynamic relations, laminar and turbulent flows, subsonic and supersonic flows as applied to flight vehicles.  Introduction to heat transfer.  4 lectures.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: AERO 301.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO306',
          catalog: '2015-2017',
          displayName: 'Aerodynamics and Flight Performance',
          units: '4',
          desc: 'Introduction to theoretical aerodynamics.  Primary emphasis in the subsonic region, including compressibility effects.  Basic aerodynamic theory:  Airfoil theory, wing theory, lift and drag.  Team-centered aerodynamic design.  Flight performance.  4 lectures.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: AERO 215, AERO 301. Concurrent: AERO 302.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'EE201',
          catalog: '2015-2017',
          displayName: 'Electric Circuit Theory',
          units: '3',
          desc: 'Application of fundamental circuit laws and theorems to the analysis of DC, and steady-state single-phase and three-phase circuits.  Not for electrical engineering majors.  3 lectures.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: MATH 244, PHYS 133.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'EE251',
          catalog: '2015-2017',
          displayName: 'Electric Circuits Laboratory',
          units: '1',
          desc: 'Techniques of measurement of DC and steady-state AC circuit parameters.  Equivalent circuits, nonlinear elements, resonance.  1 laboratory.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nConcurrent: EE 201.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO320',
          catalog: '2015-2017',
          displayName: 'Fundamentals of Dynamics and Control',
          units: '4',
          desc: 'Introduction to six degree of freedom rigid body dynamic and kinematic equations of motion, including coordinate transformations, Euler angles and quaternions for aerospace vehicles.  Linearization and dynamic system theory and stability.  Introduction to linear control theory, controller design and analysis.  4 lectures.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: AERO 300 and ME 212.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO303',
          catalog: '2015-2017',
          displayName: 'Aerothermodynamics III',
          units: '4',
          desc: 'Properties and characteristics of fluids, fluid statics and dynamics, the thermodynamic relations, laminar and turbulent flows, subsonic and supersonic flows as applied to flight vehicles.  Introduction to heat transfer.  4 lectures.\n',
          addl: 'Term Typically Offered: W\nPrerequisite: AERO 302.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO304',
          catalog: '2015-2017',
          displayName: 'Experimental Aerothermodynamics',
          units: '2',
          desc: 'Laboratory experiments verify the momentum and energy equations.  Mass flow rate, fan performance, boundary layer measurements, diffuser performance, and induction pump performance experiments are evaluated.  Introduction to electronic sensors, signals and data acquisition.  1 lecture, 1 laboratory.\n',
          addl: 'Term Typically Offered: W\nPrerequisite: ENGL 149 and AERO 301.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO331',
          catalog: '2015-2017',
          displayName: 'Aerospace Structural Analysis I',
          units: '4',
          desc: "Deflection analysis.  Principles of fictitious displacement, virtual work, and unit load method.  Energy methods:  Castigliano's theorem, Maxwell-Betti reciprocal theorem, minimum principles, Rayleigh-Ritz's method and Galerkin's method.  Stress analysis of aircraft and spacecraft components.  4 lectures.\n",
          addl: 'Term Typically Offered: W\nPrerequisite: AERO 300, CE 207, and ME 212.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO420',
          catalog: '2015-2017',
          displayName: 'Aircraft Dynamics and Control',
          units: '4',
          desc: "Newton's 6-degree-of-freedom equations of motion applied to aerospace vehicles.  Stability and control derivatives, reference frames, steady-state and perturbed dynamic analyses applied to aerospace vehicles.  Stability and control design principles applied to transfer functions, state-space, and modal system dynamics.  4 lectures.\n",
          addl: 'Term Typically Offered: W\nPrerequisite: AERO 306 and AERO 320.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO307',
          catalog: '2015-2017',
          displayName: 'Experimental Aerodynamics',
          units: '2',
          desc: 'Wind tunnel testing of basic aerodynamic properties of airfoils, finite wings, aircraft or spacecraft models, and vehicle flight performance.  Emphasis on both static and dynamic responses of aircraft.  Various measurement techniques, data reduction schemes, and analysis methods.  2 laboratories.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: AERO 302, AERO 306, ENGL 149.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO405',
          catalog: '2015-2017',
          displayName: 'Supersonic and Hypersonic Aerodynamics',
          units: '4',
          desc: 'Review of gas dynamics, shock-wave and boundary-layer interaction, aerodynamic design.  2-dimensional supersonic flows around thin airfoil; finite wing in supersonic flow.  Local surface inclination methods for high-speed flight, boundary-layer and aerodynamic heating, viscous interactions.  4 lectures.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: AERO 303; and AERO 306 or AERO 353.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO431',
          catalog: '2015-2017',
          displayName: 'Aerospace Structural Analysis II',
          units: '4',
          desc: 'Basic equations of elasticity with applications to typical aerospace structures.  Concepts studied include analysis of aircraft and aerospace structures; airworthiness and airframe loads; structural constraints; elementary aeroelasticity; structural instability; introduction to modern fatigue; fracture mechanics; and composite structures analysis.  4 lectures.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: AERO 331.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO401',
          catalog: '2015-2017',
          displayName: 'Propulsion Systems',
          units: '5',
          desc: 'Power plant types, components, characteristics, and requirements.  Principles of thrust and energy utilization.  Thermodynamic processes and performance of turboprop, turboshaft, turbofan, turbojet, ramjet, and rocket engines.  4 lectures, 1 laboratory.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: AERO 303, CHEM 124.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO443',
          catalog: '2015-2017',
          displayName: 'Aircraft Design I',
          units: '4',
          desc: 'Preliminary layout of a typical aircraft vehicle using design and calculation techniques developed in previous aerospace engineering courses.  Design of a flight vehicle, including its structures and systems.  Preparation of necessary drawings and a report.  2 lectures, 2 laboratories.  Open to students enrolled in the multidisciplinary design minor.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: Senior standing, IME 144, AERO 215, AERO 303, AERO 306, AERO 331, AERO 405, AERO 420, AERO 431. Concurrent: AERO 401.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO433',
          catalog: '2015-2017',
          displayName: 'Experimental Stress Analysis',
          units: '1',
          desc: 'Employing the knowledge of stress analysis and aerospace structural analysis in an individual and group design project dealing with aerospace structures.  1 laboratory.\n',
          addl: 'Term Typically Offered: F, W, SP\nPrerequisite: AERO 331, AERO 431.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO460',
          catalog: '2015-2017',
          displayName: 'Aerospace Engineering Professional Preparation',
          units: '1',
          desc: 'Topics on professional development for student success including resume building and career prospecting, current events in the aerospace industry, graduate studies, engineering ethics, intellectual property, non-disclosure agreements, teamwork, and innovation and entrepreneurship.  1 activity.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: Senior standing.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO444',
          catalog: '2015-2017',
          displayName: 'Aircraft Design II',
          units: '3',
          desc: 'Preliminary layout of a typical aircraft vehicle using design and calculation techniques developed in previous aerospace engineering courses.  Design of a flight vehicle, including its structures and systems.  Preparation of necessary drawings and a report.  3 laboratories.\n',
          addl: 'Term Typically Offered: W\nPrerequisite: AERO 443 and senior standing.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO465',
          catalog: '2015-2017',
          displayName: 'Aerospace Systems Senior Laboratory',
          units: '1',
          desc: 'Culminating laboratory based experience.  Experiments require the integration of the many disciplines in Aerospace Engineering.  The successful completion of each experiment requires synthesis and integration of the fundamental concepts of the engineering sciences.  Experimentation in the areas of aeroelasticity, active vibration control, inertial navigation, thermal control, hardware-in-the-loop simulation, and momentum exchange.  1 laboratory.\n',
          addl: 'Term Typically Offered: F, W\nPrerequisite: AERO 303, AERO 304, AERO 320, AERO 431 and Senior standing.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO445',
          catalog: '2015-2017',
          displayName: 'Aircraft Design III',
          units: '3',
          desc: 'Preliminary layout of a typical aircraft vehicle using design and calculation techniques developed in previous aerospace engineering courses.  Design of a flight vehicle, including its structures and systems.  Preparation of necessary drawings and a report.  3 laboratories.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: AERO 444 and senior standing.\n',
          gwrCourse: false,
          uscpCourse: false
        }
      ]
    }
  ] // sort to ensure order of items doesn't matter in cache
    .map((cache) => {
      return {
        catalog: cache.catalog,
        courses: cache.courses.sort((a, b) => a.id.localeCompare(b.id))
      };
    })
    .sort((a, b) => a.catalog.localeCompare(b.catalog))
};

const responsePayload2 = {
  generatedFlowchart: {
    name: 'test',
    programId: ['68be11b7-389b-4ebc-9b95-8997e7314497', 'b86e20fd-bea0-4b68-9d40-793b447ef700'],
    startYear: '2020',
    termData: [
      {
        tIndex: -1,
        tUnits: '0',
        courses: []
      },
      {
        tIndex: 1,
        tUnits: '23',
        courses: [
          {
            id: 'AERO121',
            color: '#FEFD9A'
          },
          {
            id: 'MATH141',
            color: '#FCD09E'
          },
          {
            id: 'IME144',
            color: '#FCD09E'
          },
          {
            id: 'ENGL134',
            color: '#DCFDD2'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, Upper-Division B, C1, C2, Lower-Division C Elective, Upper-Division C, D1, D2, Upper-Division D, Lower-Division E, F, and a GE Elective. Upper-Division B, Upper-Division C, and Upper-Division D should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: Upper-Division B, C1, Upper-Division C, D1, D3, or E.',
            customUnits: '4',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#D4FFFE',
            customId: 'Free Elective',
            customDesc:
              'Any Free Elective course can go here. Recommended: CHEM101.\r\n\r\nA total of 19-21 units of Free Elective credit are required for the default curriculum. The Chemistry Dept strongly recommends taking CHEM101 (1) in your first quarter. Also, it is suggested that you take supplemental workshops (SCM150) along with available Math/Science courses in your first year.',
            customUnits: '1',
            customDisplayName: 'Recommended: CHEM101',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 2,
        tUnits: '25',
        courses: [
          {
            id: 'CHEM124',
            color: '#FCD09E'
          },
          {
            id: 'MATH142',
            color: '#FCD09E'
          },
          {
            id: null,
            color: '#FCD09E',
            customId: 'General Physics',
            customDesc: 'Choose one of the following: PHYS131, PHYS141.',
            customUnits: '4',
            customDisplayName: 'PHYS131 or PHYS141'
          },
          {
            id: 'COMS101',
            color: '#DCFDD2'
          },
          {
            id: 'CHEM125',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'BIO161',
            color: '#FCD09E',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#D4FFFE',
            customId: 'Free Elective',
            customDesc:
              'Any Free Elective course can go here.\r\n\r\nA total of 19-21 units of Free Elective credit are required for the default curriculum. The Chemistry Dept strongly recommends taking CHEM101 (1) in your first quarter. Also, it is suggested that you take supplemental workshops (SCM150) along with available Math/Science courses in your first year.',
            customUnits: '1',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 3,
        tUnits: '29',
        courses: [
          {
            id: 'PHYS132',
            color: '#FCD09E'
          },
          {
            id: 'MATH143',
            color: '#FCD09E'
          },
          {
            id: 'ENGL149',
            color: '#FCD09E'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          },
          {
            id: 'CHEM126',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'PHYS141',
            color: '#FCD09E',
            programIdIndex: 1
          },
          {
            id: 'COMS126',
            color: '#DCFDD2',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#D4FFFE',
            customId: 'Free Elective',
            customDesc:
              'Any Free Elective course can go here.\r\n\r\nA total of 19-21 units of Free Elective credit are required for the default curriculum. The Chemistry Dept strongly recommends taking CHEM101 (1) in your first quarter. Also, it is suggested that you take supplemental workshops (SCM150) along with available Math/Science courses in your first year.',
            customUnits: '1',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 5,
        tUnits: '32',
        courses: [
          {
            id: 'AERO215',
            color: '#FEFD9A'
          },
          {
            id: 'MATH241',
            color: '#FCD09E'
          },
          {
            id: 'ME211',
            color: '#FCD09E'
          },
          {
            id: 'PHYS133',
            color: '#FCD09E'
          },
          {
            id: 'BIO213',
            color: '#FCD09E'
          },
          {
            id: 'BMED213',
            color: '#FCD09E'
          },
          {
            id: 'CHEM216',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM331',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'PHYS142',
            color: '#FCD09E',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#D4FFFE',
            customId: 'Free Elective',
            customDesc:
              'Any Free Elective course can go here.\r\n\r\nA total of 19-21 units of Free Elective credit are required for the default curriculum. The Chemistry Dept strongly recommends taking CHEM101 (1) in your first quarter. Also, it is suggested that you take supplemental workshops (SCM150) along with available Math/Science courses in your first year.',
            customUnits: '1',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 6,
        tUnits: '32',
        courses: [
          {
            id: 'MATE210',
            color: '#FCD09E'
          },
          {
            id: 'ME212',
            color: '#FCD09E'
          },
          {
            id: 'MATH244',
            color: '#FCD09E'
          },
          {
            id: 'CE204',
            color: '#FEFD9A'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          },
          {
            id: 'CHEM203',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM217',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM221',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'PHYS143',
            color: '#FCD09E',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, Upper-Division B, C1, C2, Lower-Division C Elective, Upper-Division C, D1, D2, Upper-Division D, Lower-Division E, F, and a GE Elective. Upper-Division B, Upper-Division C, and Upper-Division D should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: Upper-Division B, C1, Upper-Division C, D1, D3, or E.',
            customUnits: '4',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#D4FFFE',
            customId: 'Free Elective',
            customDesc:
              'Any Free Elective course can go here.\r\n\r\nA total of 19-21 units of Free Elective credit are required for the default curriculum. The Chemistry Dept strongly recommends taking CHEM101 (1) in your first quarter. Also, it is suggested that you take supplemental workshops (SCM150) along with available Math/Science courses in your first year.',
            customUnits: '1',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 7,
        tUnits: '33',
        courses: [
          {
            id: 'AERO301',
            color: '#FEFD9A'
          },
          {
            id: 'AERO300',
            color: '#FEFD9A'
          },
          {
            id: 'STAT312',
            color: '#FCD09E'
          },
          {
            id: 'CE207',
            color: '#FEFD9A'
          },
          {
            id: 'CHEM218',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM324',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM369',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, Upper-Division B, C1, C2, Lower-Division C Elective, Upper-Division C, D1, D2, Upper-Division D, Lower-Division E, F, and a GE Elective. Upper-Division B, Upper-Division C, and Upper-Division D should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: Upper-Division B, C1, Upper-Division C, D1, D3, or E.',
            customUnits: '4',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, Upper-Division B, C1, C2, Lower-Division C Elective, Upper-Division C, D1, D2, Upper-Division D, Lower-Division E, F, and a GE Elective. Upper-Division B, Upper-Division C, and Upper-Division D should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: Upper-Division B, C1, Upper-Division C, D1, D3, or E.',
            customUnits: '4',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 9,
        tUnits: '29',
        courses: [
          {
            id: 'AERO302',
            color: '#FEFD9A'
          },
          {
            id: 'AERO306',
            color: '#F9A3D2'
          },
          {
            id: 'EE201',
            color: '#FEFD9A'
          },
          {
            id: 'EE251',
            color: '#FEFD9A'
          },
          {
            id: 'AERO320',
            color: '#FEFD9A'
          },
          {
            id: 'CHEM303',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM372',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#FEFD9A',
            customId: 'Choose One',
            customDesc: 'Choose one of the following: CHEM474, or BIO476.',
            customUnits: '3',
            customDisplayName: 'CHEM474 or BIO476',
            programIdIndex: 1
          },
          {
            id: 'CHEM444',
            color: '#F9A3D2',
            programIdIndex: 1
          },
          {
            id: 'CHEM447',
            color: '#F9A3D2',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 10,
        tUnits: '26',
        courses: [
          {
            id: 'AERO303',
            color: '#FEFD9A'
          },
          {
            id: 'AERO304',
            color: '#FEFD9A'
          },
          {
            id: 'AERO331',
            color: '#FEFD9A'
          },
          {
            id: 'AERO420',
            color: '#F9A3D2'
          },
          {
            id: null,
            color: '#DA9593',
            customId: 'Graduation Writing Requirement',
            customDesc:
              'Students can attempt to fulfill the requirement after 90 earned units; students should complete the requirement before senior year. Any GWR class or GWR exam can go here. Refer to current catalog for prerequisites.\n'
          },
          {
            id: 'CHEM373',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM351',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM448',
            color: '#F9A3D2',
            programIdIndex: 1
          },
          {
            id: 'CHEM445',
            color: '#F9A3D2',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#D4FFFE',
            customId: 'Free Elective',
            customDesc: 'Any Free Elective course can go here.',
            customUnits: '1',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 11,
        tUnits: '32',
        courses: [
          {
            id: 'AERO307',
            color: '#F9A3D2'
          },
          {
            id: 'AERO405',
            color: '#F9A3D2'
          },
          {
            id: 'AERO431',
            color: '#FEFD9A'
          },
          {
            id: null,
            color: '#F9A3D2',
            customId: 'Aeronautics Approved Electives',
            customDesc:
              'Any Aeronautics Approved Electives can go here. Consultation with advisor is recommended prior to selecting approved courses; bear in mind your selections may impact pursuit of postbaccalaureate studies and/or goals.',
            customUnits: '4'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          },
          {
            id: 'CHEM475',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM352',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM451',
            color: '#F9A3D2',
            programIdIndex: 1
          },
          {
            id: 'CHEM450',
            color: '#F9A3D2',
            programIdIndex: 1
          },
          {
            id: 'CHEM446',
            color: '#F9A3D2',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#DA9593',
            customId: 'Graduation Writing Requirement',
            customDesc:
              'Students can attempt to fulfill the requirement after 90 earned units; students should complete the requirement before senior year. Refer to current catalog for prerequisites.',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 13,
        tUnits: '30',
        courses: [
          {
            id: 'AERO401',
            color: '#F9A3D2'
          },
          {
            id: 'AERO443',
            color: '#F9A3D2'
          },
          {
            id: 'AERO433',
            color: '#FEFD9A'
          },
          {
            id: 'AERO460',
            color: '#FEFD9A'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          },
          {
            id: 'CHEM403',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: 'CHEM353',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, Upper-Division B, C1, C2, Lower-Division C Elective, Upper-Division C, D1, D2, Upper-Division D, Lower-Division E, F, and a GE Elective. Upper-Division B, Upper-Division C, and Upper-Division D should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: Upper-Division B, C1, Upper-Division C, D1, D3, or E.',
            customUnits: '4',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, Upper-Division B, C1, C2, Lower-Division C Elective, Upper-Division C, D1, D2, Upper-Division D, Lower-Division E, F, and a GE Elective. Upper-Division B, Upper-Division C, and Upper-Division D should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: Upper-Division B, C1, Upper-Division C, D1, D3, or E.',
            customUnits: '4',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#D4FFFE',
            customId: 'Free Elective',
            customDesc: 'Any Free Elective course can go here.',
            customUnits: '3',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 14,
        tUnits: '25',
        courses: [
          {
            id: null,
            color: '#F9A3D2',
            customId: 'Aeronautics Approved Electives',
            customDesc:
              'Any Aeronautics Approved Electives can go here. Consultation with advisor is recommended prior to selecting approved courses; bear in mind your selections may impact pursuit of postbaccalaureate studies and/or goals.',
            customUnits: '4'
          },
          {
            id: 'AERO444',
            color: '#F9A3D2'
          },
          {
            id: 'AERO465',
            color: '#FEFD9A'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, Upper-Division B, C1, C2, Lower-Division C Elective, Upper-Division C, D1, D2, Upper-Division D, Lower-Division E, F, and a GE Elective. Upper-Division B, Upper-Division C, and Upper-Division D should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: Upper-Division B, C1, Upper-Division C, D1, D3, or E.',
            customUnits: '4',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, Upper-Division B, C1, C2, Lower-Division C Elective, Upper-Division C, D1, D2, Upper-Division D, Lower-Division E, F, and a GE Elective. Upper-Division B, Upper-Division C, and Upper-Division D should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: Upper-Division B, C1, Upper-Division C, D1, D3, or E.',
            customUnits: '4',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, Upper-Division B, C1, C2, Lower-Division C Elective, Upper-Division C, D1, D2, Upper-Division D, Lower-Division E, F, and a GE Elective. Upper-Division B, Upper-Division C, and Upper-Division D should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: Upper-Division B, C1, Upper-Division C, D1, D3, or E.',
            customUnits: '4',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#D4FFFE',
            customId: 'Free Elective',
            customDesc: 'Any Free Elective course can go here.',
            customUnits: '1',
            programIdIndex: 1
          }
        ]
      },
      {
        tIndex: 15,
        tUnits: '27-31',
        courses: [
          {
            id: null,
            color: '#F9A3D2',
            customId: 'Aeronautics Approved Electives',
            customDesc:
              'Any Aeronautics Approved Electives can go here. Consultation with advisor is recommended prior to selecting approved courses; bear in mind your selections may impact pursuit of postbaccalaureate studies and/or goals.',
            customUnits: '4'
          },
          {
            id: 'AERO445',
            color: '#F9A3D2'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, C1, C2, C3, C4, D1, D2, D3, D4. C4 should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: C3, C4, D1, D3, or D4.',
            customUnits: '4'
          },
          {
            id: 'CHEM356',
            color: '#FEFD9A',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#FCD09E',
            customId: 'Choose One',
            customDesc: 'Choose one of the following: MCRO224, BIO452, or CHEM432.',
            customUnits: '3-5',
            customDisplayName: 'MCRO224, BIO452, or CHEM432',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#DCFDD2',
            customId: 'GE',
            customDesc:
              'One course from each of the following GE areas must be completed: A1, A2, A3, Upper-Division B, C1, C2, Lower-Division C Elective, Upper-Division C, D1, D2, Upper-Division D, Lower-Division E, F, and a GE Elective. Upper-Division B, Upper-Division C, and Upper-Division D should be taken only after Junior standing is reached (90 units). Refer to online catalog for GE course selection, United States Cultural Pluralism (USCP) and Graduation Writing Requirement (GWR). USCP requirement can be satisfied by some (but not all) courses within GE categories: Upper-Division B, C1, Upper-Division C, D1, D3, or E.',
            customUnits: '4',
            programIdIndex: 1
          },
          {
            id: null,
            color: '#D4FFFE',
            customId: 'Free Elective',
            customDesc: 'Any Free Elective course can go here.',
            customUnits: '3-5',
            programIdIndex: 1
          }
        ]
      }
    ],
    unitTotal: '343-347',
    notes: '',
    version: CURRENT_FLOW_DATA_VERSION,
    publishedId: null,
    importedId: null
  },
  courseCache: [
    {
      catalog: '2015-2017',
      courses: [
        {
          id: 'AERO121',
          catalog: '2015-2017',
          displayName: 'Aerospace Fundamentals',
          units: '2',
          desc: 'Introduction to the engineering profession including the aeronautical and aerospace fields. Engineering approach to problem-solving and analysis of data obtained from experiments. Basic nomenclature and design criteria used in the aerospace industry. Applications to basic problems in the field. 1 lecture, 1 laboratory.\n',
          addl: 'Term Typically Offered: F\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATH141',
          catalog: '2015-2017',
          displayName: 'Calculus I',
          units: '4',
          desc: 'Limits, continuity, differentiation.  Introduction to integration.  4 lectures.  Crosslisted as HNRS/MATH 141.  Fulfills GE B1; for students admitted Fall 2016 or later, a grade of C- or better in one GE B1 course is required to fulfill GE Area B.\n',
          addl: 'GE Area B1\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: Completion of ELM requirement and passing score on appropriate Mathematics Placement Examination, or MATH 118 and high school trigonometry, or MATH 119.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'IME144',
          catalog: '2015-2017',
          displayName: 'Introduction to Design and Manufacturing',
          units: '4',
          desc: 'Supplemental review of visualization, sketching, and drafting fundamentals.  Computer-aided solid modeling of parts and assemblies.  Introduction to conventional machining processes on lathes and mills, computer numerical control, quality control, production methods, and design for manufacturing.  Open to all majors.  2 lectures, 2 laboratories.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nRecommended: IME 140 or ME 129 (Formerly ME 151).\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'ENGL134',
          catalog: '2015-2017',
          displayName: 'Writing and Rhetoric',
          units: '4',
          desc: 'Rhetorical principles and tactics applied to written work.  Writing as a recursive process that leads to greater organizational coherency, stylistic complexity, and rhetorical awareness.  4 lectures.  Fulfills GE A1; for students admitted Fall 2016 or later a grade of C- or better is required to fulfill GE Area A1.\n',
          addl: 'GE Area A1\nTerm Typically Offered: F, W, SP\nPrerequisite: Satisfactory score on the English Placement Test.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM124',
          catalog: '2015-2017',
          displayName: 'General Chemistry for Physical Science and Engineering I',
          units: '4',
          desc: 'Stoichiometry, thermochemistry, atomic structure, bonding, solid-state structures, intermolecular forces, and foundational principles of organic chemistry.  Not open to students with credit in CHEM 127.  Credit will be granted in only one of the following courses:  CHEM 110, CHEM 111, CHEM 124.  3 lectures, 1 laboratory.  Fulfills GE B3 & B4.\n',
          addl: 'GE Area B4; GE Area B3\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: Passing score on ELM, or an ELM exemption, or credit in MATH 104. Recommended: High school chemistry or equivalent.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATH142',
          catalog: '2015-2017',
          displayName: 'Calculus II',
          units: '4',
          desc: 'Techniques of integration, applications to physics, transcendental functions.  4 lectures.  Crosslisted as HNRS/MATH 142.  Fulfills GE B1; for students admitted Fall 2016 or later, a grade of C- or better in one GE B1 course is required to fulfill GE Area B.\n',
          addl: 'GE Area B1\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: MATH 141 with a grade of C- or better or consent of instructor.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'COMS101',
          catalog: '2015-2017',
          displayName: 'Public Speaking',
          units: '4',
          desc: 'Introduction to the principles of public speaking. Practical experience in the development, presentation, and critical analysis of speeches to inform, to persuade, and to actuate. Not open to students with credit in COMS 102. 4 lectures. Crosslisted as COMS/HNRS 101. Fulfills GE A2; for students admitted Fall 2016 or later a grade of C- or better is required to fulfill GE Area A2.\n',
          addl: 'GE Area A2\nTerm Typically Offered: F,W,SP,SU\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'PHYS132',
          catalog: '2015-2017',
          displayName: 'General Physics II',
          units: '4',
          desc: 'Oscillations, waves in elastic media, sound waves.  Temperature, heat and the first law of thermodynamics.  Kinetic theory of matter, second law of thermodynamics.  Geometrical and physical optics.  3 lectures, 1 laboratory.  Crosslisted as HNRS/PHYS 132.  Fulfills GE B3 & B4.\n',
          addl: 'GE Area B3; GE Area B4\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: PHYS 131 or HNRS 131 or PHYS 141.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATH143',
          catalog: '2015-2017',
          displayName: 'Calculus III',
          units: '4',
          desc: 'Infinite sequences and series, vector algebra, curves.  4 lectures.  Crosslisted as HNRS/MATH 143.  Fulfills GE B1; for students admitted Fall 2016 or later, a grade of C- or better in one GE B1 course is required to fulfill GE Area B.\n',
          addl: 'GE Area B1\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: MATH 142 with a grade of C- or better or consent of instructor.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'ENGL149',
          catalog: '2015-2017',
          displayName: 'Technical Writing for Engineers',
          units: '4',
          desc: 'The principles of technical writing.  Discussion and application of rhetorical principles in technical environments.  Study of methods, resources and common formats used in corporate or research writing.  4 lectures.  Crosslisted as ENGL/HNRS 149.  Fulfills GE A3; for students admitted Fall 2016 or later a grade of C- or better is required to fulfill GE Area A3.\n',
          addl: 'GE Area A3\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: Completion of GE Area A1 with a C- or better, or consent of instructor; for Engineering students only. Recommended: Completion of GE Area A2.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO215',
          catalog: '2015-2017',
          displayName: 'Introduction to Aerospace Design',
          units: '2',
          desc: 'Introduction to problem solving techniques and team-centered design projects in aerospace engineering.  Primary emphasis on the solutions of design problems in aerospace engineering using computers.  2 laboratories.\n',
          addl: 'Term Typically Offered: F, W\nPrerequisite: AERO 121, MATH 143, and IME 144. Recommended: CSC 111.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATH241',
          catalog: '2015-2017',
          displayName: 'Calculus IV',
          units: '4',
          desc: 'Partial derivatives, multiple integrals, introduction to vector analysis.  4 lectures.  Crosslisted as HNRS/MATH 241.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: MATH 143.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'ME211',
          catalog: '2015-2017',
          displayName: 'Engineering Statics',
          units: '3',
          desc: 'Analysis of forces on engineering structures in equilibrium.  Properties of forces, moments, couples, and resultants.  Equilibrium conditions, friction, centroids, area moments of inertia.  Introduction to mathematical modeling and problem solving.  Vector mathematics where appropriate.  3 lectures.  Crosslisted as HNRS/ME 211.\n',
          addl: 'Term Typically Offered: F, W, SP\nPrerequisite: MATH 241 (or concurrently), PHYS 131 or PHYS 141.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'PHYS133',
          catalog: '2015-2017',
          displayName: 'General Physics III',
          units: '4',
          desc: 'Charge and matter, electric field, electric potential, dielectrics, capacitance, current and resistance, electromotive force and circuits, magnetic fields, magnetic field of a moving charge, induced emf.  3 lectures, 1 laboratory.  Fulfills GE B3 & B4.\n',
          addl: 'GE Area B3; GE Area B4\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: PHYS 131 or HNRS 131 or PHYS 141, and MATH 142. Recommended: MATH 241.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'BIO213',
          catalog: '2015-2017',
          displayName: 'Life Science for Engineers',
          units: '2',
          desc: 'Fundamentals of life sciences:  energetics, cell biology, molecular and classical genetics, microbiology, organismal biology, and ecology.  2 lectures.  Fulfills GE B2.\n',
          addl: 'GE Area B2\nTerm Typically Offered: F, W, SP\nPrerequisite: MATH 142; for engineering students only. Corequisite: BMED/BRAE 213. Recommended: CHEM 124.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'BMED213',
          catalog: '2015-2017',
          displayName: 'Bioengineering Fundamentals',
          units: '2',
          desc: 'Treatment of the engineering applications of biology.  Genetic engineering and the industrial application of microbiology.  Systems physiology with engineering applications.  Structure and function relationships in biological systems.  The impact of life on its environment.  2 lectures.  Crosslisted as BRAE/BMED 213.  Fulfills GE B2.  Formerly BRAE/ENGR 213.\n',
          addl: 'GE Area B2\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: MATH 142; for engineering students only. Corequisite: BIO 213. Recommended: CHEM 124.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATE210',
          catalog: '2015-2017',
          displayName: 'Materials Engineering',
          units: '3',
          desc: 'Structure of matter.  Physical and mechanical properties of materials including metals, polymers, ceramics, composites, and electronic materials.  Equilibrium diagrams.  Heat treatments, materials selection and corrosion phenomena.  3 lectures.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: CHEM 111 or CHEM 124 or CHEM 127. Recommended: Concurrent enrollment in MATE 215.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'ME212',
          catalog: '2015-2017',
          displayName: 'Engineering Dynamics',
          units: '3',
          desc: 'Analysis of motions of particles and rigid bodies encountered in engineering.  Velocity, acceleration, relative motion, work, energy, impulse, and momentum.  Further development of mathematical modeling and problem solving.  Vector mathematics where appropriate.  3 lectures.  Crosslisted as HNRS 214/ME 212.\n',
          addl: 'Term Typically Offered: F, W, SP\nPrerequisite: MATH 241; ME 211 or ARCE 211.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'MATH244',
          catalog: '2015-2017',
          displayName: 'Linear Analysis I',
          units: '4',
          desc: 'Separable and linear ordinary differential equations with selected applications; numerical and analytical solutions.  Linear algebra:  vectors in n-space, matrices, linear transformations, eigenvalues, eigenvectors, diagonalization; applications to the study of systems of linear differential equations.  4 lectures.  Crosslisted as HNRS/MATH 244.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: MATH 143.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CE204',
          catalog: '2015-2017',
          displayName: 'Mechanics of Materials I',
          units: '3',
          desc: 'Stresses, strains, and deformations associated with axial, torsional, and flexural loading of bars, shafts, and beams.  Analysis of elementary determinate and indeterminate mechanical and structural systems.  2 lectures, 1 activity.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: ME 211.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO301',
          catalog: '2015-2017',
          displayName: 'Aerothermodynamics I',
          units: '4',
          desc: 'Properties and characteristics of fluids, fluid statics and dynamics, the thermodynamic relations, laminar and turbulent flows, subsonic and supersonic flows as applied to flight vehicles.  Introduction to heat transfer.  4 lectures.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: ME 211. Corequisite: AERO 300.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO300',
          catalog: '2015-2017',
          displayName: 'Aerospace Engineering Analysis',
          units: '5',
          desc: 'Analytical methods for aerospace engineering problems.  Topics include vector calculus, linear algebra, differential equations, Laplace transforms and Fourier series.  Computer tools and numerical methods as applied to problems in aerodynamics, structures, stability and control and astronautics.  4 lectures, 1 laboratory.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: AERO 215, MATH 244, ME 211, and PHYS 133.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'STAT312',
          catalog: '2015-2017',
          displayName: 'Statistical Methods for Engineers',
          units: '4',
          desc: 'Descriptive and graphical methods.  Discrete and continuous probability distributions.  One and two sample confidence intervals and hypothesis testing.  Single factor analysis of variance.  Quality control.  Introduction to regression and to experimental design.  Substantial use of statistical software.  4 lectures.  Fulfills GE B6.\n',
          addl: 'GE Area B6\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: MATH 142.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CE207',
          catalog: '2015-2017',
          displayName: 'Mechanics of Materials II',
          units: '2',
          desc: 'Combined stress states including torsion, axial, shear, moment, and pressure vessel loadings.  Principle stress/strain states.  Basic failure criteria.  Analysis of beam forces, moments, deflections, and rotations.  Introduction to stability concepts including column buckling.  1 lecture, 1 activity.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: CE 204.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO302',
          catalog: '2015-2017',
          displayName: 'Aerothermodynamics II',
          units: '4',
          desc: 'Properties and characteristics of fluids, fluid statics and dynamics, the thermodynamic relations, laminar and turbulent flows, subsonic and supersonic flows as applied to flight vehicles.  Introduction to heat transfer.  4 lectures.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: AERO 301.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO306',
          catalog: '2015-2017',
          displayName: 'Aerodynamics and Flight Performance',
          units: '4',
          desc: 'Introduction to theoretical aerodynamics.  Primary emphasis in the subsonic region, including compressibility effects.  Basic aerodynamic theory:  Airfoil theory, wing theory, lift and drag.  Team-centered aerodynamic design.  Flight performance.  4 lectures.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: AERO 215, AERO 301. Concurrent: AERO 302.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'EE201',
          catalog: '2015-2017',
          displayName: 'Electric Circuit Theory',
          units: '3',
          desc: 'Application of fundamental circuit laws and theorems to the analysis of DC, and steady-state single-phase and three-phase circuits.  Not for electrical engineering majors.  3 lectures.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nPrerequisite: MATH 244, PHYS 133.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'EE251',
          catalog: '2015-2017',
          displayName: 'Electric Circuits Laboratory',
          units: '1',
          desc: 'Techniques of measurement of DC and steady-state AC circuit parameters.  Equivalent circuits, nonlinear elements, resonance.  1 laboratory.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\nConcurrent: EE 201.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO320',
          catalog: '2015-2017',
          displayName: 'Fundamentals of Dynamics and Control',
          units: '4',
          desc: 'Introduction to six degree of freedom rigid body dynamic and kinematic equations of motion, including coordinate transformations, Euler angles and quaternions for aerospace vehicles.  Linearization and dynamic system theory and stability.  Introduction to linear control theory, controller design and analysis.  4 lectures.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: AERO 300 and ME 212.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO303',
          catalog: '2015-2017',
          displayName: 'Aerothermodynamics III',
          units: '4',
          desc: 'Properties and characteristics of fluids, fluid statics and dynamics, the thermodynamic relations, laminar and turbulent flows, subsonic and supersonic flows as applied to flight vehicles.  Introduction to heat transfer.  4 lectures.\n',
          addl: 'Term Typically Offered: W\nPrerequisite: AERO 302.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO304',
          catalog: '2015-2017',
          displayName: 'Experimental Aerothermodynamics',
          units: '2',
          desc: 'Laboratory experiments verify the momentum and energy equations.  Mass flow rate, fan performance, boundary layer measurements, diffuser performance, and induction pump performance experiments are evaluated.  Introduction to electronic sensors, signals and data acquisition.  1 lecture, 1 laboratory.\n',
          addl: 'Term Typically Offered: W\nPrerequisite: ENGL 149 and AERO 301.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO331',
          catalog: '2015-2017',
          displayName: 'Aerospace Structural Analysis I',
          units: '4',
          desc: "Deflection analysis.  Principles of fictitious displacement, virtual work, and unit load method.  Energy methods:  Castigliano's theorem, Maxwell-Betti reciprocal theorem, minimum principles, Rayleigh-Ritz's method and Galerkin's method.  Stress analysis of aircraft and spacecraft components.  4 lectures.\n",
          addl: 'Term Typically Offered: W\nPrerequisite: AERO 300, CE 207, and ME 212.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO420',
          catalog: '2015-2017',
          displayName: 'Aircraft Dynamics and Control',
          units: '4',
          desc: "Newton's 6-degree-of-freedom equations of motion applied to aerospace vehicles.  Stability and control derivatives, reference frames, steady-state and perturbed dynamic analyses applied to aerospace vehicles.  Stability and control design principles applied to transfer functions, state-space, and modal system dynamics.  4 lectures.\n",
          addl: 'Term Typically Offered: W\nPrerequisite: AERO 306 and AERO 320.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO307',
          catalog: '2015-2017',
          displayName: 'Experimental Aerodynamics',
          units: '2',
          desc: 'Wind tunnel testing of basic aerodynamic properties of airfoils, finite wings, aircraft or spacecraft models, and vehicle flight performance.  Emphasis on both static and dynamic responses of aircraft.  Various measurement techniques, data reduction schemes, and analysis methods.  2 laboratories.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: AERO 302, AERO 306, ENGL 149.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO405',
          catalog: '2015-2017',
          displayName: 'Supersonic and Hypersonic Aerodynamics',
          units: '4',
          desc: 'Review of gas dynamics, shock-wave and boundary-layer interaction, aerodynamic design.  2-dimensional supersonic flows around thin airfoil; finite wing in supersonic flow.  Local surface inclination methods for high-speed flight, boundary-layer and aerodynamic heating, viscous interactions.  4 lectures.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: AERO 303; and AERO 306 or AERO 353.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO431',
          catalog: '2015-2017',
          displayName: 'Aerospace Structural Analysis II',
          units: '4',
          desc: 'Basic equations of elasticity with applications to typical aerospace structures.  Concepts studied include analysis of aircraft and aerospace structures; airworthiness and airframe loads; structural constraints; elementary aeroelasticity; structural instability; introduction to modern fatigue; fracture mechanics; and composite structures analysis.  4 lectures.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: AERO 331.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO401',
          catalog: '2015-2017',
          displayName: 'Propulsion Systems',
          units: '5',
          desc: 'Power plant types, components, characteristics, and requirements.  Principles of thrust and energy utilization.  Thermodynamic processes and performance of turboprop, turboshaft, turbofan, turbojet, ramjet, and rocket engines.  4 lectures, 1 laboratory.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: AERO 303, CHEM 124.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO443',
          catalog: '2015-2017',
          displayName: 'Aircraft Design I',
          units: '4',
          desc: 'Preliminary layout of a typical aircraft vehicle using design and calculation techniques developed in previous aerospace engineering courses.  Design of a flight vehicle, including its structures and systems.  Preparation of necessary drawings and a report.  2 lectures, 2 laboratories.  Open to students enrolled in the multidisciplinary design minor.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: Senior standing, IME 144, AERO 215, AERO 303, AERO 306, AERO 331, AERO 405, AERO 420, AERO 431. Concurrent: AERO 401.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO433',
          catalog: '2015-2017',
          displayName: 'Experimental Stress Analysis',
          units: '1',
          desc: 'Employing the knowledge of stress analysis and aerospace structural analysis in an individual and group design project dealing with aerospace structures.  1 laboratory.\n',
          addl: 'Term Typically Offered: F, W, SP\nPrerequisite: AERO 331, AERO 431.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO460',
          catalog: '2015-2017',
          displayName: 'Aerospace Engineering Professional Preparation',
          units: '1',
          desc: 'Topics on professional development for student success including resume building and career prospecting, current events in the aerospace industry, graduate studies, engineering ethics, intellectual property, non-disclosure agreements, teamwork, and innovation and entrepreneurship.  1 activity.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: Senior standing.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO444',
          catalog: '2015-2017',
          displayName: 'Aircraft Design II',
          units: '3',
          desc: 'Preliminary layout of a typical aircraft vehicle using design and calculation techniques developed in previous aerospace engineering courses.  Design of a flight vehicle, including its structures and systems.  Preparation of necessary drawings and a report.  3 laboratories.\n',
          addl: 'Term Typically Offered: W\nPrerequisite: AERO 443 and senior standing.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO465',
          catalog: '2015-2017',
          displayName: 'Aerospace Systems Senior Laboratory',
          units: '1',
          desc: 'Culminating laboratory based experience.  Experiments require the integration of the many disciplines in Aerospace Engineering.  The successful completion of each experiment requires synthesis and integration of the fundamental concepts of the engineering sciences.  Experimentation in the areas of aeroelasticity, active vibration control, inertial navigation, thermal control, hardware-in-the-loop simulation, and momentum exchange.  1 laboratory.\n',
          addl: 'Term Typically Offered: F, W\nPrerequisite: AERO 303, AERO 304, AERO 320, AERO 431 and Senior standing.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'AERO445',
          catalog: '2015-2017',
          displayName: 'Aircraft Design III',
          units: '3',
          desc: 'Preliminary layout of a typical aircraft vehicle using design and calculation techniques developed in previous aerospace engineering courses.  Design of a flight vehicle, including its structures and systems.  Preparation of necessary drawings and a report.  3 laboratories.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: AERO 444 and senior standing.\n',
          gwrCourse: false,
          uscpCourse: false
        }
      ]
    },
    {
      catalog: '2022-2026',
      courses: [
        {
          id: 'CHEM125',
          catalog: '2022-2026',
          displayName: 'General Chemistry for Physical Science and Engineering II',
          units: '4',
          desc: 'Topics include solution chemistry, thermodynamics, kinetics, equilibrium (including acids and bases), electrochemistry, and nuclear chemistry.  Not open to students with credit in CHEM 128.  3 lectures, 1 laboratory.  Fulfills GE Areas B1 and B3 (GE Areas B3 and B4 for students on the 2019-20 or earlier catalogs).\n',
          addl: 'Term Typically Offered: F, W, SP\n2020-21 or later catalog: GE Area B1\n2020-21 or later catalog: GE Area B3\n2019-20 or earlier catalog: GE Area B3\n2019-20 or earlier catalog: GE Area B4\nPrerequisite: CHEM 124, or AP Chemistry score of 5.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'BIO161',
          catalog: '2022-2026',
          displayName: 'Introduction to Cell and Molecular Biology',
          units: '4',
          desc: 'Fundamentals of cellular biology with an emphasis on the molecular perspective of life:  biomolecules, cellular energetics, cell structure and reproduction, molecular mechanisms of genetics and gene expression.  3 lectures, 1 laboratory.  Fulfills GE Areas B2 and B3 (GE Areas B2 and B4 for students on the 2019-20 or earlier catalogs).\n',
          addl: 'Term Typically Offered: F,W,SP,SU\n2020-21 or later catalog: GE Area B2\n2020-21 or later catalog: GE Area B3\n2019-20 or earlier catalog: GE Area B2\n2019-20 or earlier catalog: GE Area B4\nRecommended: CHEM 110 or CHEM 124 or CHEM 127.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM126',
          catalog: '2022-2026',
          displayName: 'General Chemistry for Physical Science and Engineering III',
          units: '4',
          desc: 'Topics in equilibrium, kinetics, acid-base chemistry, and molecular structure, contextualized within major sub-disciplines of chemistry.  Not open to students with credit in CHEM 129.  3 lectures, 1 laboratory.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: CHEM 125 with a grade of C- or better or consent of instructor.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'PHYS141',
          catalog: '2022-2026',
          displayName: 'General Physics I',
          units: '4',
          desc: 'Fundamental principles of mechanics.  Vectors, particle kinematics.  Equilibrium of a rigid body.  Work and energy, linear momentum, rotational kinematics and dynamics.  Primarily for engineering and science students.  Course may be offered in classroom-based or online format.  4 lectures.  Crosslisted as HNRS 134/PHYS 141.  Fulfills GE Area B1 (GE Area B3 for students on the 2019-20 or earlier catalogs).\n',
          addl: 'Term Typically Offered: F,W,SP,SU\n2020-21 or later catalog: GE Area B1\n2019-20 or earlier catalog: GE Area B3\nPrerequisite: MATH 141 with grade C- or better. Corequisite: MATH 142 or MATH 182. Recommended: High School Physics.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'COMS126',
          catalog: '2022-2026',
          displayName: 'Argument and Advocacy',
          units: '4',
          desc: 'The nature of critical thinking as applied in oral and written argument.  Study of inductive and deductive reasoning.  Analysis of reasoning, argument, forms of support and fallacies of argument and language.  Instruction in and practical experience in crafting sound persuasive arguments and engaging in oral argumentation.  Course may be offered in classroom-based or hybrid format.  4 lectures.   Fulfills GE Area A3 with a grade of C- or better.\n',
          addl: 'Term Typically Offered: F\n2020-21 or later catalog: GE Area A3\n2019-20 or earlier catalog: GE Area A3\nPrerequisite: Completion of GE Area A2 with a grade of C- or better (GE Area A1 for student on the 2019-20 or an earlier catalog). Recommended: Completion of GE Area A1 with a grade of C- or better (GE Area A2 for student on the 2019-20 or an earlier catalog).\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM216',
          catalog: '2022-2026',
          displayName: 'Organic Chemistry I',
          units: '5',
          desc: 'Fundamental concepts and laboratory skills of organic chemistry.  Structure, bonding, nomenclature, isomerism, stereochemistry and physical properties of organic compounds.  Introduction to spectroscopy.  Reactions and mechanisms of alkanes, alkenes and alkyl halides.  Fundamental laboratory techniques in organic chemistry.  Not open to students with credit in CHEM 316.  4 lectures, 1 laboratory.\n',
          addl: 'Term Typically Offered: F, W\nPrerequisite: CHEM 126 or CHEM 129 with a grade of C- or better or consent of instructor.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM331',
          catalog: '2022-2026',
          displayName: 'Quantitative Analysis',
          units: '5',
          desc: 'Theory and application of chemical equilibrium to analytical problems.  Survey of important analytical methods with stress placed on the theory and application associated with titrimetric and spectrophotometric analysis.  3 lectures, 2 laboratories.\n',
          addl: 'Term Typically Offered: F, SP, SU\nPrerequisite: CHEM 126 or CHEM 129.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'PHYS142',
          catalog: '2022-2026',
          displayName: 'General Physics II',
          units: '4',
          desc: 'Oscillations, waves in elastic media, sound waves.  Temperature, heat and the first law of thermodynamics.  Kinetic theory of matter, second law of thermodynamics.  Geometrical and physical optics.  3 lectures, 1 laboratory.  Crosslisted as HNRS 132/PHYS 142.  Fulfills GE Areas B1 and B3 (GE Areas B3 and B4 for students on the 2019-20 or earlier catalogs).  Formerly PHYS 132.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\n2020-21 or later catalog: GE Area B1\n2020-21 or later catalog: GE Area B3\n2019-20 or earlier catalog: GE Area B3\n2019-20 or earlier catalog: GE Area B4\nPrerequisite: PHYS 141; and MATH 142 or MATH 182.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM203',
          catalog: '2022-2026',
          displayName: 'Undergraduate Seminar I',
          units: '1',
          desc: 'Introduction to basic scientific literature and scientific presentation skills.  Targeted advising and preparation for research and career opportunities.  Designed for second-year students majoring in Biochemistry or in Chemistry.  Credit/No Credit grading only.  1 seminar.\n',
          addl: 'Term Typically Offered: W, SP\nCR/NC\nPrerequisite: CHEM 126.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM217',
          catalog: '2022-2026',
          displayName: 'Organic Chemistry II',
          units: '3',
          desc: 'Properties and reactions of carbonyl compounds, alcohols, ethers, amines and carbohydrates with an in-depth treatment of the reaction mechanisms.  Introductory concepts and applications of infrared and NMR spectroscopy.  Not open to students with credit in CHEM 317.  3 lectures.\n',
          addl: 'Term Typically Offered: W, SP\nPrerequisite: CHEM 216 with a grade of C- or better or consent of instructor. Corequisite: CHEM 221 for Chemistry and Biochemistry majors; or CHEM 220 for non-Chemistry and non-Biochemistry majors.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM221',
          catalog: '2022-2026',
          displayName: 'Organic Chemistry Laboratory II',
          units: '2',
          desc: 'Laboratory experiments exploring reactions in organic chemistry, applying fundamental laboratory techniques covered in CHEM 216.  2 laboratories.\n',
          addl: 'Term Typically Offered: W, SP\nPrerequisite: major in Chemistry or Biochemistry. Corequisite: CHEM 217.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'PHYS143',
          catalog: '2022-2026',
          displayName: 'General Physics III',
          units: '4',
          desc: 'Charge and matter, electric field, electric potential, dielectrics, capacitance, current and resistance, electromotive force and circuits, magnetic fields, magnetic field of a moving charge, induced emf.  3 lectures, 1 laboratory.  Fulfills GE Areas B1 and B3 (GE Areas B3 and B4 for students on the 2019-20 or earlier catalogs).  Formerly PHYS 133.\n',
          addl: 'Term Typically Offered: F,W,SP,SU\n2020-21 or later catalog: GE Area B1\n2020-21 or later catalog: GE Area B3\n2019-20 or earlier catalog: GE Area B3\n2019-20 or earlier catalog: GE Area B4\nPrerequisite: MATH 142 and PHYS 141. Recommended: MATH 241.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM218',
          catalog: '2022-2026',
          displayName: 'Organic Chemistry III',
          units: '3',
          desc: 'Properties and reactions of alkynes, heterocyclic and aromatic compounds with an in-depth treatment of the mechanisms of the reactions.  Introductory concepts and applications of ultraviolet spectroscopy and mass spectrometry.  Not open to students with credit in CHEM 318.  3 lectures.\n',
          addl: 'Term Typically Offered: F, SP\nPrerequisite: CHEM 217 with a grade of C- or better or consent of instructor. Corequisite: CHEM 324 for Chemistry and Biochemistry majors; or CHEM 223 for non-Chemistry and non-Biochemistry majors.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM324',
          catalog: '2022-2026',
          displayName: 'Organic Chemistry Laboratory III',
          units: '2',
          desc: 'Practice in multiple step organic synthesis, column chromatography, vacuum distillation, enzymes as chemical reagents, inert atmosphere techniques, introduction to FT NMR spectroscopy and mass spectrometry, survey of organic chemical literature.  2 laboratories.\n',
          addl: 'Term Typically Offered: F, SP\nPrerequisite: major in Chemistry or Biochemistry. Corequisite: CHEM 218.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM369',
          catalog: '2022-2026',
          displayName: 'Biochemical Principles',
          units: '5',
          desc: 'Chemistry and function of major cellular constituents:  proteins, lipids, carbohydrates, nucleic acids, and membranes.  Mechanisms of protein function and regulation and enzyme catalysis.  4 lectures, 1 laboratory.   Fulfills GE Area Upper-Division B (GE Areas B5, B6, or B7 for students on the 2019-20 catalog).\n',
          addl: 'Term Typically Offered: F, W, SP\n2020-21 or later: Upper-Div GE Area B\n2019-20 or earlier catalog: GE Area B5, B6, or B7\nPrerequisite: Junior standing; completion of GE Area A with grades C- or better; completion of GE Area B1 (GE Area B3 for students on the 2019-20 or earlier catalogs); one course in GE Area B4 with a grade of C- or better (GE Area B1 for students on the 2019-20 or earlier catalogs); BIO 161; and CHEM 217 or CHEM 317.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM303',
          catalog: '2022-2026',
          displayName: 'Undergraduate Seminar II',
          units: '1',
          desc: 'Advanced exploration of more sophisticated scientific literature and scientific presentation skills.  Targeted advising and preparation for research and career opportunities.  Designed for third-year CHEM and BCHM majors.  Credit/No Credit grading only.  1 seminar.\n',
          addl: 'Term Typically Offered: F, W, SP\nCR/NC\nPrerequisite: CHEM 203 and CHEM 218.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM372',
          catalog: '2022-2026',
          displayName: 'Metabolism',
          units: '4',
          desc: 'Intermediary metabolism of carbohydrates, lipids, amino acids and nucleotides, regulation and integration of metabolic pathways, bioenergetics, photosynthesis, electron transport, nitrogen fixation, biochemical function of vitamins and minerals.  4 lectures.\n',
          addl: 'Term Typically Offered: F, SP\nPrerequisite: CHEM 369 or CHEM 371.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM444',
          catalog: '2022-2026',
          displayName: 'Polymers & Coatings I',
          units: '3',
          desc: 'Physical properties of polymers and coatings and their measurement.  Molecular weight averages, glass transition, thermodynamics of polymers.  Viscoelastic properties, rheology, molecular weight determination.  Thermal analysis, spectroscopic analysis, mechanical testing.  3 lectures.\n',
          addl: 'Term Typically Offered: F\nPrerequisite: CHEM 212/312 or CHEM 216/316.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM447',
          catalog: '2022-2026',
          displayName: 'Polymers and Coatings Laboratory I',
          units: '2',
          desc: 'Experimental techniques of producing and characterizing coatings.  Polymer characterization and analysis.  Molecular weight analysis using viscometry, light scattering, and gel permeation chromatography.  Thermal analysis using differential scanning calorimetry, thermal mechanical analysis and dynamic mechanical analysis.  Polymer rheology.  Infrared, Raman and FT-NMR spectroscopy.  Atomic force microscopy.  2 laboratories.\n',
          addl: 'Term Typically Offered: F\nCorequisite: CHEM 444.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM373',
          catalog: '2022-2026',
          displayName: 'Molecular Biology',
          units: '3',
          desc: 'Structure of nucleic acids and chromosomes.  Mechanisms and regulation of nucleic acid and protein synthesis.  Molecular biology techniques.  3 lectures.\n',
          addl: 'Term Typically Offered: W, SP\nPrerequisite: CHEM 369 or CHEM 371.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM351',
          catalog: '2022-2026',
          displayName: 'Physical Chemistry I',
          units: '3',
          desc: 'Basic physical chemistry for the study of chemical and biochemical systems.  Kinetic-molecular theory, gas laws, principles of thermodynamics.  3 lectures.\n',
          addl: 'Term Typically Offered: F, W\nPrerequisite: CHEM 126 or CHEM 129; MATH 143; PHYS 122 or PHYS 132 or PHYS 142.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM448',
          catalog: '2022-2026',
          displayName: 'Polymers and Coatings Laboratory II',
          units: '2',
          desc: 'Polymer synthesis using solution, suspension, bulk, emulsion techniques.  Synthesis of chain growth polymers using free radical, anionic, cationic, and other catalysts.  Synthesis of step-growth polymers.  Kinetics of polymer reactions.  Synthesis of resins used in modern coatings.  2 laboratories.\n',
          addl: 'Term Typically Offered: W\nPrerequisite: CHEM 447. Corequisite: CHEM 445.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM445',
          catalog: '2022-2026',
          displayName: 'Polymers & Coatings II',
          units: '3',
          desc: 'Introduction to polymerization methods and mechanisms.  Chemistry of initiators, catalysts and inhibitors, kinetics of polymerization.  Uses of representative polymer types.  Synthesis, film formation, structure and properties of polymers commonly used in coatings and adhesives.  3 lectures.\n',
          addl: 'Term Typically Offered: W\nPrerequisite: CHEM 217/317 and CHEM 444.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM475',
          catalog: '2022-2026',
          displayName: 'Molecular Biology Laboratory',
          units: '3',
          desc: 'Introduction to techniques used in molecular biology and biotechnology; DNA extraction, characterization, cloning, Southern blotting, reverse transcription, polymerase chain reaction, and sequencing analysis.  1 lecture, 2 laboratories.  Crosslisted as BIO/CHEM 475.\n',
          addl: 'Term Typically Offered: F, W, SP\nPrerequisite: BIO 161, and grade of C- or better in BIO 351 or CHEM 373 or consent of instructor.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM352',
          catalog: '2022-2026',
          displayName: 'Physical Chemistry II',
          units: '3',
          desc: 'Application of physical chemistry to chemical and biochemical systems.  Electrochemistry, kinetics, viscosity, surface and transport properties.  3 lectures.\n',
          addl: 'Term Typically Offered: W, SP\nPrerequisite: CHEM 351.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM451',
          catalog: '2022-2026',
          displayName: 'Polymers and Coatings Laboratory III',
          units: '2',
          desc: 'Preparation and characterization of coatings - solvent based and waterborne.  Thermoplastic and thermosetting coatings.  Coating film preparation methods.  Applications of spectroscopy, scanning probe microscopy, thermal analysis, rheology in characterizing coatings.  VOC, long-term exposure testing.  Measurement of appearance (color, gloss).  Not open to students with credit in CHEM 551.  2 laboratories.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: CHEM 447 or CHEM 547. Corequisite: CHEM 450. Recommended: CHEM 445 or CHEM 545; CHEM 448 or CHEM 548; CHEM 446.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM450',
          catalog: '2022-2026',
          displayName: 'Polymers and Coatings III',
          units: '3',
          desc: "Formulation of modern coatings.  Raw materials including resins, solvents, pigments, and additives.  Formulation principles for solvent-borne and coatings, waterborne, powder, radiation cure and architectural coatings.  Regulatory issues; VOC's.  Coating properties, film formation, film defects, application methods, color and color acceptance.  Not open to students with credit in CHEM 550.  3 lectures.\n",
          addl: 'Term Typically Offered: SP\nPrerequisite: CHEM 444 or CHEM 544.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM446',
          catalog: '2022-2026',
          displayName: 'Surface Chemistry of Materials',
          units: '3',
          desc: 'Surface energy.  Capillarity, solid and liquid interface, adsorption.  Surface areas of solids.  Contact angles and wetting.  Friction, lubrication and adhesion.  Relationship of surface to bulk properties of materials.  Applications.  3 lectures.  Crosslisted as CHEM/MATE 446.\n',
          addl: 'Term Typically Offered: SP\nPrerequisite: CHEM 125 or CHEM 128; CHEM 351, MATE 380, or ME 302.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM403',
          catalog: '2022-2026',
          displayName: 'Undergraduate Seminar III: Senior Project',
          units: '1',
          desc: 'Culminating experience with high level scientific literature and scientific presentation skills.  Targeted advising and preparation for research and career opportunities.  Designed for fourth-year CHEM and BCHM majors.  1 seminar.\n',
          addl: 'Term Typically Offered: F, W, SP\nPrerequisite: CHEM 303 and CHEM 352.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM353',
          catalog: '2022-2026',
          displayName: 'Physical Chemistry III',
          units: '3',
          desc: 'Principles and applications of quantum chemistry.  Chemical bonding and molecular structure.  Spectroscopy and diffraction.  3 lectures.\n',
          addl: 'Term Typically Offered: F, SP\nPrerequisite: CHEM 352.\n',
          gwrCourse: false,
          uscpCourse: false
        },
        {
          id: 'CHEM356',
          catalog: '2022-2026',
          displayName: 'Physical Chemistry Laboratory',
          units: '2',
          desc: 'Experimental studies of gases, solutions, thermochemistry, chemical and phase equilibria, electrochemistry, chemical and enzyme kinetics, computational methods and applications to chemistry and biochemistry.  Written communication of scientific results using applicable literature and databases.  2 laboratories.  Fulfills GWR.\n',
          addl: 'Term Typically Offered: F, W, SP\nGWR\nPrerequisite: Junior standing; completion of GE Area A with grades of C- or better; and CHEM 231/331. Corequisite: CHEM 352.\n',
          gwrCourse: true,
          uscpCourse: false
        }
      ]
    }
  ]
    // sort to ensure order of items doesn't matter in cache
    .map((cache) => {
      return {
        catalog: cache.catalog,
        courses: cache.courses.sort((a, b) => a.id.localeCompare(b.id))
      };
    })
    .sort((a, b) => a.catalog.localeCompare(b.catalog))
};

test.describe('generate flowchart api input tests', () => {
  test.beforeAll(async () => {
    // create account
    await createUser({
      email: GENERATE_FLOWCHART_TESTS_API_1_EMAIL,
      username: 'test',
      password: 'test'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(GENERATE_FLOWCHART_TESTS_API_1_EMAIL);
  });

  test('generate flowchart api returns 401 without authorization', async ({ request }) => {
    const res = await request.get('/api/data/generateFlowchart');

    const expectedResponseBody = {
      message: 'Generate flowchart request must be authenticated.'
    };

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 without any data', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_1_EMAIL, 'test');

    const res = await request.get('/api/data/generateFlowchart');

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        name: ['Flowchart name is required.'],
        startYear: ['Start year is required.'],
        programIds: ['Program Id(s) required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 w missing flowchart name', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_1_EMAIL, 'test');

    const searchParams = new URLSearchParams({
      startYear: '2020',
      programIds: '68be11b7-389b-4ebc-9b95-8997e7314497'
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        name: ['Flowchart name is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 w empty flowchart name', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_1_EMAIL, 'test');

    const searchParams = new URLSearchParams({
      name: '',
      startYear: '2020',
      programIds: '68be11b7-389b-4ebc-9b95-8997e7314497'
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        name: ['Flowchart name must not be blank.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 w flowchart name too long', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_1_EMAIL, 'test');

    const name = crypto
      .randomBytes(FLOW_NAME_MAX_LENGTH)
      .toString('hex')
      .slice(0, FLOW_NAME_MAX_LENGTH + 1);

    const searchParams = new URLSearchParams({
      name,
      startYear: '2020',
      programIds: '68be11b7-389b-4ebc-9b95-8997e7314497'
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        name: [`Flowchart name too long, max length is ${FLOW_NAME_MAX_LENGTH} characters.`]
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 w invalid start year', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_1_EMAIL, 'test');

    const searchParams = new URLSearchParams({
      name: 'test',
      startYear: 'invalid',
      programIds: '68be11b7-389b-4ebc-9b95-8997e7314497'
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        startYear: ['Invalid start year format.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 w invalid program id (one program)', async ({
    request
  }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_1_EMAIL, 'test');

    const searchParams = new URLSearchParams({
      name: 'test',
      startYear: '2020',
      programIds: 'invalid'
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        programIds: ['Invalid format for program unique ID(s).']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 w invalid program id (multiple programs)', async ({
    request
  }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_1_EMAIL, 'test');

    const searchParams = new URLSearchParams({
      name: 'test',
      startYear: '2020',
      programIds: '68be11b7-389b-4ebc-9b95-8997e7314497,invalid'
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        programIds: ['Invalid format for program unique ID(s).']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 w empty programs id', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_1_EMAIL, 'test');

    const searchParams = new URLSearchParams({
      name: 'test',
      startYear: '2020',
      programIds: ''
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        programIds: ['Invalid format for program unique ID(s).']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 with duplicate program ids', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_1_EMAIL, 'test');

    const searchParams = new URLSearchParams({
      name: 'test',
      startYear: '2020',
      programIds: '68be11b7-389b-4ebc-9b95-8997e7314497,68be11b7-389b-4ebc-9b95-8997e7314497'
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        programIds: ['Cannot have duplicate program ids in flowchart.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 200 with valid options', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_1_EMAIL, 'test');

    // will test the responses in a different set of tests

    // just standard thing
    const res1 = await request.get(
      `/api/data/generateFlowchart?${new URLSearchParams({
        name: 'test',
        startYear: '2020',
        programIds: '68be11b7-389b-4ebc-9b95-8997e7314497'
      }).toString()}`
    );
    expect(res1.status()).toBe(200);

    const res2 = await request.get(
      `/api/data/generateFlowchart?${new URLSearchParams({
        name: 'another test!',
        startYear: '2015',
        programIds:
          '68be11b7-389b-4ebc-9b95-8997e7314497,cc560aff-4fef-4f61-9406-ce1354d65f9d,ab68f61e-2241-424f-b4c8-d6870bf3d238'
      }).toString()}`
    );
    expect(res2.status()).toBe(200);

    const res3 = await request.get(
      `/api/data/generateFlowchart?${new URLSearchParams({
        name: 'another test!',
        startYear: '2015',
        programIds:
          '68be11b7-389b-4ebc-9b95-8997e7314497,cc560aff-4fef-4f61-9406-ce1354d65f9d,ab68f61e-2241-424f-b4c8-d6870bf3d238',
        removeGECourses: 'true',
        generateCourseCache: 'true'
      }).toString()}`
    );
    expect(res3.status()).toBe(200);

    const res4 = await request.get(
      `/api/data/generateFlowchart?${new URLSearchParams({
        name: 'another test!',
        startYear: '2015',
        programIds:
          '68be11b7-389b-4ebc-9b95-8997e7314497,cc560aff-4fef-4f61-9406-ce1354d65f9d,ab68f61e-2241-424f-b4c8-d6870bf3d238',
        removeGECourses: 'false',
        generateCourseCache: 'true'
      }).toString()}`
    );
    expect(res4.status()).toBe(200);

    const res5 = await request.get(
      `/api/data/generateFlowchart?${new URLSearchParams({
        name: 'another test!',
        startYear: '2015',
        programIds:
          '68be11b7-389b-4ebc-9b95-8997e7314497,cc560aff-4fef-4f61-9406-ce1354d65f9d,ab68f61e-2241-424f-b4c8-d6870bf3d238',
        removeGECourses: 'true',
        generateCourseCache: 'false'
      }).toString()}`
    );
    expect(res5.status()).toBe(200);
  });
});

test.describe('generate flowchart api output tests', () => {
  let ownerId: string;

  test.beforeAll(async () => {
    // create account
    const newUserId = await createUser({
      email: GENERATE_FLOWCHART_TESTS_API_2_EMAIL,
      username: 'test',
      password: 'test'
    });

    if (newUserId) {
      ownerId = newUserId;
    }
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(GENERATE_FLOWCHART_TESTS_API_2_EMAIL);
  });

  test('generate valid flowchart with 1 program', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_2_EMAIL, 'test');

    const res = await request.get(
      `/api/data/generateFlowchart?${new URLSearchParams({
        name: 'test',
        startYear: '2020',
        programIds: '68be11b7-389b-4ebc-9b95-8997e7314497'
      }).toString()}`
    );
    expect(res.status()).toBe(200);

    // make sure date is serialized back to Date object for flowchart validation
    const resData = (await res.json()) as GenerateFlowchartExpectedReturnType;
    resData.generatedFlowchart.lastUpdatedUTC = new Date(resData.generatedFlowchart.lastUpdatedUTC);

    const expectedResponseBody = {
      message: 'Flowchart successfully generated.',
      generatedFlowchart: {
        ...responsePayload1.generatedFlowchart,
        ownerId
      },
      courseCache: responsePayload1.courseCache
    };

    // verify that we got a valid flowchart back
    // do it this way so when it fails we know what validation step failed
    expect(() => flowchartValidationSchema.parse(resData.generatedFlowchart)).not.toThrowError();

    // remove these fields before comparison but after validation since they change on every request
    const resDataRelevantProperties = {
      message: resData.message,
      generatedFlowchart: deleteObjectProperties(resData.generatedFlowchart, [
        'id',
        'hash',
        'lastUpdatedUTC'
      ]),
      // sort to ensure order of items doesn't matter in cache
      courseCache: resData.courseCache
        ?.map((cache) => {
          return {
            catalog: cache.catalog,
            courses: cache.courses.sort((a, b) => a.id.localeCompare(b.id))
          };
        })
        .sort((a, b) => a.catalog.localeCompare(b.catalog))
    };

    // remove dynamicTerms as this can change over time
    expect(cloneAndDeleteNestedProperty(resDataRelevantProperties, 'dynamicTerms')).toStrictEqual(
      cloneAndDeleteNestedProperty(expectedResponseBody, 'dynamicTerms')
    );
  });

  test('generate valid flowchart with 1 program without coursecache', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_2_EMAIL, 'test');

    const res = await request.get(
      `/api/data/generateFlowchart?${new URLSearchParams({
        name: 'test',
        startYear: '2020',
        programIds: '68be11b7-389b-4ebc-9b95-8997e7314497',
        generateCourseCache: 'false'
      }).toString()}`
    );
    expect(res.status()).toBe(200);

    // make sure date is serialized back to Date object
    const resData = (await res.json()) as GenerateFlowchartExpectedReturnType;
    resData.generatedFlowchart.lastUpdatedUTC = new Date(resData.generatedFlowchart.lastUpdatedUTC);

    const expectedResponseBody = {
      message: 'Flowchart successfully generated.',
      generatedFlowchart: {
        ...responsePayload1.generatedFlowchart,
        ownerId
      }
    };

    // verify that we got a valid flowchart back
    // do it this way so when it fails we know what validation step failed
    expect(() => flowchartValidationSchema.parse(resData.generatedFlowchart)).not.toThrowError();

    // remove these fields before comparison but after validation since they change on every request
    const resDataRelevantProperties = {
      message: resData.message,
      generatedFlowchart: deleteObjectProperties(resData.generatedFlowchart, [
        'id',
        'hash',
        'lastUpdatedUTC'
      ])
    };

    // remove dynamicTerms as this can change over time
    expect(cloneAndDeleteNestedProperty(resDataRelevantProperties, 'dynamicTerms')).toStrictEqual(
      cloneAndDeleteNestedProperty(expectedResponseBody, 'dynamicTerms')
    );
  });

  test('generate valid flowchart with 1 program without ge courses', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_2_EMAIL, 'test');

    const res = await request.get(
      `/api/data/generateFlowchart?${new URLSearchParams({
        name: 'test',
        startYear: '2020',
        programIds: '68be11b7-389b-4ebc-9b95-8997e7314497',
        removeGECourses: 'true'
      }).toString()}`
    );
    expect(res.status()).toBe(200);

    // make sure date is serialized back to Date object
    const resData = (await res.json()) as GenerateFlowchartExpectedReturnType;
    resData.generatedFlowchart.lastUpdatedUTC = new Date(resData.generatedFlowchart.lastUpdatedUTC);

    const expectedResponseBody = {
      message: 'Flowchart successfully generated.',
      generatedFlowchart: {
        ...responsePayload1.generatedFlowchartNoGE,
        ownerId
      },
      courseCache: responsePayload1.courseCache
    };
    // to satisfy type safety
    const cache = expectedResponseBody.courseCache.find((cache) => cache.catalog === '2015-2017');
    if (cache) {
      cache.courses = cache.courses.filter((crs) => !['ENGL134', 'COMS101'].includes(crs.id));
    }

    // verify that we got a valid flowchart back
    // do it this way so when it fails we know what validation step failed
    expect(() => flowchartValidationSchema.parse(resData.generatedFlowchart)).not.toThrowError();

    // remove these fields before comparison but after validation since they change on every request
    const resDataRelevantProperties = {
      message: resData.message,
      generatedFlowchart: deleteObjectProperties(resData.generatedFlowchart, [
        'id',
        'hash',
        'lastUpdatedUTC'
      ]),
      courseCache: resData.courseCache
    };

    // remove dynamicTerms as this can change over time
    expect(cloneAndDeleteNestedProperty(resDataRelevantProperties, 'dynamicTerms')).toStrictEqual(
      cloneAndDeleteNestedProperty(expectedResponseBody, 'dynamicTerms')
    );
  });

  test('generate valid flowchart with multiple programs', async ({ request }) => {
    await performLoginBackend(request, GENERATE_FLOWCHART_TESTS_API_2_EMAIL, 'test');

    const res = await request.get(
      `/api/data/generateFlowchart?${new URLSearchParams({
        name: 'test',
        startYear: '2020',
        programIds: '68be11b7-389b-4ebc-9b95-8997e7314497,b86e20fd-bea0-4b68-9d40-793b447ef700'
      }).toString()}`
    );
    expect(res.status()).toBe(200);

    // make sure date is serialized back to Date object
    const resData = (await res.json()) as GenerateFlowchartExpectedReturnType;
    resData.generatedFlowchart.lastUpdatedUTC = new Date(resData.generatedFlowchart.lastUpdatedUTC);

    const expectedResponseBody = {
      message: 'Flowchart successfully generated.',
      generatedFlowchart: {
        ...responsePayload2.generatedFlowchart,
        ownerId
      },
      courseCache: responsePayload2.courseCache
    };

    // verify that we got a valid flowchart back
    // do it this way so when it fails we know what validation step failed
    expect(() => flowchartValidationSchema.parse(resData.generatedFlowchart)).not.toThrowError();

    // remove these fields before comparison but after validation since they change on every request
    const resDataRelevantProperties = {
      message: resData.message,
      generatedFlowchart: deleteObjectProperties(resData.generatedFlowchart, [
        'id',
        'hash',
        'lastUpdatedUTC'
      ]),
      // sort to ensure order of items doesn't matter in cache
      courseCache: resData.courseCache
        ?.map((cache) => {
          return {
            catalog: cache.catalog,
            courses: cache.courses.sort((a, b) => a.id.localeCompare(b.id))
          };
        })
        .sort((a, b) => a.catalog.localeCompare(b.catalog))
    };

    // remove dynamicTerms as this can change over time
    expect(cloneAndDeleteNestedProperty(resDataRelevantProperties, 'dynamicTerms')).toStrictEqual(
      cloneAndDeleteNestedProperty(expectedResponseBody, 'dynamicTerms')
    );
  });
});
