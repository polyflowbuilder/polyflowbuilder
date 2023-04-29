import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { getUserFlowcharts } from '$lib/server/db/flowchart';
import { performLoginBackend } from '../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import { CURRENT_FLOW_DATA_VERSION } from '$lib/common/config/flowDataConfig.js';
import { cloneAndDeleteNestedProperty } from '../util/testUtil.js';

const GET_USER_FLOWCHARTS_TESTS_API_EMAIL = 'pfb_test_getUserFlowchartsAPI_playwright@test.com';

test.describe('getUserFlowcharts API tests', () => {
  const prisma = new PrismaClient();

  test.beforeAll(async () => {
    // create account
    await createUser({
      email: GET_USER_FLOWCHARTS_TESTS_API_EMAIL,
      username: 'test',
      password: 'test'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(GET_USER_FLOWCHARTS_TESTS_API_EMAIL);
  });

  test('fetch results in 400 without authentication', async ({ request }) => {
    const res = await request.get('/api/user/data/getUserFlowcharts');

    const expectedResponseBody = {
      message: 'Request was unauthenticated. Please authenticate and try again.'
    };

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('authenticated request succeeds with 200 empty flowcharts list', async ({ request }) => {
    // perform login
    await performLoginBackend(request, GET_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test');

    // test with empty flowcharts
    const res = await request.get('/api/user/data/getUserFlowcharts');

    const expectedResponseBody = {
      message: 'User flowchart retrieval successful.',
      flowcharts: []
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('authenticated request succeeds with 200 empty flowcharts list (+ course cache)', async ({
    request
  }) => {
    // perform login
    await performLoginBackend(request, GET_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test');

    // test with empty flowcharts
    const res = await request.get('/api/user/data/getUserFlowcharts?includeCourseCache=true');

    const expectedResponseBody = {
      message: 'User flowchart retrieval successful.',
      flowcharts: [],
      courseCache: [
        {
          catalog: '2015-2017',
          courses: []
        },
        {
          catalog: '2017-2019',
          courses: []
        },
        {
          catalog: '2019-2020',
          courses: []
        },
        {
          catalog: '2020-2021',
          courses: []
        },
        {
          catalog: '2021-2022',
          courses: []
        },
        {
          catalog: '2022-2026',
          courses: []
        }
      ]
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('authenticated request succeeds with 200 nonempty flowcharts list', async ({ request }) => {
    // create flowcharts
    const id = await prisma.user.findFirst({
      where: {
        email: GET_USER_FLOWCHARTS_TESTS_API_EMAIL
      },
      select: {
        id: true
      }
    });
    if (!id) {
      throw new Error('id is null');
    }

    await prisma.dBFlowchart.createMany({
      data: [
        {
          hash: '1',
          name: 'test1',
          notes: '',
          ownerId: id.id,
          programId1: '0017f92d-d73f-4819-9d59-8c658cd29be5',
          startYear: '2020',
          termData: [],
          unitTotal: '0',
          version: CURRENT_FLOW_DATA_VERSION,
          pos: 4
        },
        {
          hash: '2',
          name: 'test2',
          notes: '',
          ownerId: id.id,
          programId1: '002e8710-245f-46a4-8689-2ab2f5a47170',
          startYear: '2022',
          termData: [],
          unitTotal: '1',
          version: CURRENT_FLOW_DATA_VERSION,
          pos: 2
        }
      ]
    });

    // perform login
    await performLoginBackend(request, GET_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test');

    // test with empty flowcharts
    const res = await request.get('/api/user/data/getUserFlowcharts');

    const expectedFlowcharts = (await getUserFlowcharts(id.id)).map(({ flowchart }) => flowchart);

    const expectedResponseBody = {
      message: 'User flowchart retrieval successful.',
      // need to serialize date object bc thats what we receive from API
      flowcharts: expectedFlowcharts.map((flow) => ({
        ...flow,
        lastUpdatedUTC: flow.lastUpdatedUTC.toISOString()
      }))
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(expectedResponseBody);
  });

  test('authenticated request succeeds with 200 nonempty flowcharts list (+ course cache)', async ({
    request
  }) => {
    // create flowcharts
    const id = await prisma.user.findFirst({
      where: {
        email: GET_USER_FLOWCHARTS_TESTS_API_EMAIL
      },
      select: {
        id: true
      }
    });
    if (!id) {
      throw new Error('id is null');
    }

    await prisma.dBFlowchart.createMany({
      data: [
        {
          hash: '1',
          name: 'test1',
          notes: '',
          ownerId: id.id,
          programId1: '0017f92d-d73f-4819-9d59-8c658cd29be5',
          startYear: '2020',
          termData: [
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
          ],
          unitTotal: '0',
          version: CURRENT_FLOW_DATA_VERSION,
          pos: 4
        },
        {
          hash: '2',
          name: 'test2',
          notes: '',
          ownerId: id.id,
          programId1: '002e8710-245f-46a4-8689-2ab2f5a47170',
          startYear: '2022',
          termData: [
            {
              tIndex: 1,
              tUnits: '12',
              courses: [
                {
                  color: '#FEFD9A',
                  id: 'CPE101'
                },
                {
                  color: '#FEFD9A',
                  id: 'CSC480'
                },
                {
                  color: '#FEFD9A',
                  id: 'CHEM124'
                }
              ]
            }
          ],
          unitTotal: '1',
          version: CURRENT_FLOW_DATA_VERSION,
          pos: 2
        }
      ]
    });

    // perform login
    await performLoginBackend(request, GET_USER_FLOWCHARTS_TESTS_API_EMAIL, 'test');

    // test with empty flowcharts
    const res = await request.get('/api/user/data/getUserFlowcharts?includeCourseCache=true');

    const expectedFlowcharts = (await getUserFlowcharts(id.id)).map(({ flowchart }) => flowchart);

    const expectedResponseBody = {
      message: 'User flowchart retrieval successful.',
      // need to serialize date object bc thats what we receive from API
      flowcharts: expectedFlowcharts.map((flow) => ({
        ...flow,
        lastUpdatedUTC: flow.lastUpdatedUTC.toISOString()
      })),
      courseCache: [
        {
          catalog: '2015-2017',
          courses: [
            {
              id: 'CPE101',
              catalog: '2015-2017',
              displayName: 'Fundamentals of Computer Science I',
              units: '4',
              desc: 'Basic principles of algorithmic problem solving and programming using methods of top-down design, stepwise refinement and procedural abstraction.  Basic control structures, data types, and input/output.  Introduction to the software development process:  design, implementation, testing and documentation.  The syntax and semantics of a modern programming language.  Credit not available for students who have taken CSC/CPE 108.  3 lectures, 1 laboratory.  Crosslisted as CPE/CSC 101.\n',
              addl: 'Term Typically Offered: F, W, SP\nPrerequisite: Completion of ELM requirement, and passing score on MAPE or MATH 117 with a grade of C- or better or MATH 118 with a grade of C- or better, or consent of instructor.\n',
              gwrCourse: false,
              uscpCourse: false,
              dynamicTerms: null
            },
            {
              id: 'CSC480',
              catalog: '2015-2017',
              displayName: 'Artificial Intelligence',
              units: '4',
              desc: 'Programs and techniques that characterize artificial intelligence.  Programming in a high level language.  3 lectures, 1 laboratory.  Crosslisted as CPE/CSC 480.\n',
              addl: 'Term Typically Offered: TBD\nPrerequisite: CSC/CPE 103 with a grade of C- or better.\n',
              gwrCourse: false,
              uscpCourse: false,
              dynamicTerms: null
            },
            {
              id: 'CHEM124',
              catalog: '2015-2017',
              displayName: 'General Chemistry for Physical Science and Engineering I',
              units: '4',
              desc: 'Stoichiometry, thermochemistry, atomic structure, bonding, solid-state structures, intermolecular forces, and foundational principles of organic chemistry.  Not open to students with credit in CHEM 127.  Credit will be granted in only one of the following courses:  CHEM 110, CHEM 111, CHEM 124.  3 lectures, 1 laboratory.  Fulfills GE B3 & B4.\n',
              addl: 'GE Area B4; GE Area B3\nTerm Typically Offered: F,W,SP,SU\nPrerequisite: Passing score on ELM, or an ELM exemption, or credit in MATH 104. Recommended: High school chemistry or equivalent.\n',
              gwrCourse: false,
              uscpCourse: false,
              dynamicTerms: null
            }
          ]
        },
        {
          catalog: '2017-2019',
          courses: [
            {
              id: 'AGC301',
              catalog: '2017-2019',
              displayName: 'New Media Communication Strategies in Agriculture',
              units: '4',
              desc: 'Exploration and implementation of emerging new media communication strategies and technologies to convey information on important issues in agriculture to a global audience.  Focus on food and farming dialogues currently populating conversations about production agriculture.  Adaptation of different writing styles based on requirements of the various new media channels.  Analysis of metrics to measure level of engagement with desired audience.  3 lectures, 1 laboratory.\n',
              addl: 'Term Typically Offered: W\nPrerequisite: Junior standing. Recommended: JOUR 203, JOUR 205.\n',
              gwrCourse: false,
              uscpCourse: false,
              dynamicTerms: null
            },
            {
              id: 'AGB301',
              catalog: '2017-2019',
              displayName: 'Food and Fiber Marketing',
              units: '4',
              desc: 'Food and fiber marketing, examining commodity, industrial, and consumer product marketing from a managerial viewpoint.  A global perspective in understanding consumer needs and developing the knowledge of economic, political, social and environmental factors that affect food and fiber marketing systems.  4 lectures.\n',
              addl: 'Term Typically Offered: F, W, SP\nPrerequisite: AGB 212 or ECON 221.\n',
              gwrCourse: false,
              uscpCourse: false,
              dynamicTerms: null
            },
            {
              id: 'JOUR312',
              catalog: '2017-2019',
              displayName: 'Public Relations',
              units: '4',
              desc: 'Overview of the history, growth and ongoing development of public relations as an information management function in a multicultural environment.  Public relations practices used in commercial and non-profit sectors, and firsthand application of public relations skills.  4 lectures.\n',
              addl: 'Term Typically Offered: F, W\nPrerequisite: Sophomore standing.\n',
              gwrCourse: false,
              uscpCourse: false,
              dynamicTerms: null
            }
          ]
        },
        {
          catalog: '2019-2020',
          courses: []
        },
        {
          catalog: '2020-2021',
          courses: []
        },
        {
          catalog: '2021-2022',
          courses: []
        },
        {
          catalog: '2022-2026',
          courses: []
        }
      ]
    };

    expect(res.status()).toBe(200);
    expect(cloneAndDeleteNestedProperty(await res.json(), 'dynamicTerms')).toEqual(
      cloneAndDeleteNestedProperty(expectedResponseBody, 'dynamicTerms')
    );
  });

  // TODO: 500 case tests
});

// TODO: ADD TESTS TO CHECK IF FLOWCHART DATA IS FETCHED ON LOGIN
