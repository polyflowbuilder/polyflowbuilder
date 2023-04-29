import * as apiDataConfig from '$lib/server/config/apiDataConfig';
import {
  generateCourseCacheFlowchart,
  generateUserCourseCache
} from '$lib/server/util/courseCacheUtil';
import { CURRENT_FLOW_DATA_VERSION } from '$lib/common/config/flowDataConfig';
import { cloneAndDeleteNestedProperty } from '../../../../tests/util/testUtil';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types';

// init API data
await apiDataConfig.init();

describe('generateCourseCacheFlowchart tests', () => {
  test('generate course cache for flowchart with empty data', () => {
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
      version: CURRENT_FLOW_DATA_VERSION,
      importedId: null,
      publishedId: null
    };

    const expectedCourseCache: CourseCache[] = apiDataConfig.apiData.catalogs.map((catalog) => ({
      catalog,
      courses: []
    }));

    expect(generateCourseCacheFlowchart(flow1)).toStrictEqual(expectedCourseCache);
  });

  test('generate course cache for one flowchart with one catalog', () => {
    const flow1: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: '',
      notes: '',
      ownerId: '',
      programId: ['68be11b7-389b-4ebc-9b95-8997e7314497'],
      startYear: '',
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
      unitTotal: '',
      version: CURRENT_FLOW_DATA_VERSION,
      importedId: null,
      publishedId: null
    };

    const expectedCourseCache: CourseCache[] = apiDataConfig.apiData.catalogs.map((catalog) => ({
      catalog,
      courses:
        catalog !== '2015-2017'
          ? []
          : [
              {
                id: 'AGC301',
                catalog: '2015-2017',
                displayName: 'New Media Communication Strategies in Agriculture',
                units: '4',
                desc: 'Exploration and implementation of emerging new media communication strategies and technologies to convey information on important issues in agriculture to a global audience.  Focus on food and farming dialogues currently populating conversations about production agriculture.  Adaptation of different writing styles based on requirements of the various new media channels.  Analysis of metrics to measure level of engagement with desired audience.  3 lectures, 1 laboratory.\n',
                addl: 'Term Typically Offered: W\nPrerequisite: JOUR 205. Recommended: JOUR 203.\n',
                gwrCourse: false,
                uscpCourse: false,
                dynamicTerms: null
              },
              {
                id: 'AGB301',
                catalog: '2015-2017',
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
                catalog: '2015-2017',
                displayName: 'Public Relations',
                units: '4',
                desc: 'Overview of the history, growth and ongoing development of public relations as an information management function in a multicultural environment.  Public relations practices used in commercial and non-profit sectors, and firsthand application of public relations skills.  4 lectures.\n',
                addl: 'Term Typically Offered: F, W\nPrerequisite: Sophomore standing.\n',
                gwrCourse: false,
                uscpCourse: false,
                dynamicTerms: null
              }
            ]
    }));

    expect(
      cloneAndDeleteNestedProperty(generateCourseCacheFlowchart(flow1), 'dynamicTerms')
    ).toStrictEqual(cloneAndDeleteNestedProperty(expectedCourseCache, 'dynamicTerms'));
  });

  test('generate course cache for one flowchart with two catalogs', () => {
    const flow1: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: '',
      notes: '',
      ownerId: '',
      programId: ['68be11b7-389b-4ebc-9b95-8997e7314497', 'cb65784d-23d6-44a9-ae7a-03b4b50d5b36'],
      startYear: '',
      termData: [
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
      ],
      unitTotal: '',
      version: CURRENT_FLOW_DATA_VERSION,
      importedId: null,
      publishedId: null
    };

    const expectedCourseCache: CourseCache[] = apiDataConfig.apiData.catalogs.map((catalog) => ({
      catalog,
      courses: []
    }));

    const courseCache1517 = expectedCourseCache.find((cache) => cache.catalog === '2015-2017');
    const courseCache2226 = expectedCourseCache.find((cache) => cache.catalog === '2022-2026');
    if (!courseCache1517) {
      throw new Error('courseCache1517 should be defined');
    }
    if (!courseCache2226) {
      throw new Error('courseCache2226 should be defined');
    }

    courseCache1517.courses = [
      {
        id: 'AGC301',
        catalog: '2015-2017',
        displayName: 'New Media Communication Strategies in Agriculture',
        units: '4',
        desc: 'Exploration and implementation of emerging new media communication strategies and technologies to convey information on important issues in agriculture to a global audience.  Focus on food and farming dialogues currently populating conversations about production agriculture.  Adaptation of different writing styles based on requirements of the various new media channels.  Analysis of metrics to measure level of engagement with desired audience.  3 lectures, 1 laboratory.\n',
        addl: 'Term Typically Offered: W\nPrerequisite: JOUR 205. Recommended: JOUR 203.\n',
        gwrCourse: false,
        uscpCourse: false,
        dynamicTerms: null
      },
      {
        id: 'AGB301',
        catalog: '2015-2017',
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
        catalog: '2015-2017',
        displayName: 'Public Relations',
        units: '4',
        desc: 'Overview of the history, growth and ongoing development of public relations as an information management function in a multicultural environment.  Public relations practices used in commercial and non-profit sectors, and firsthand application of public relations skills.  4 lectures.\n',
        addl: 'Term Typically Offered: F, W\nPrerequisite: Sophomore standing.\n',
        gwrCourse: false,
        uscpCourse: false,
        dynamicTerms: null
      }
    ];

    courseCache2226.courses = [
      {
        id: 'KINE134',
        catalog: '2022-2026',
        displayName: 'Pickleball',
        units: '1',
        desc: 'Basic instruction in skill development, knowledge, and desirable attitudes toward physical activity. Fundamental pickleball skills, knowledge, and strategy such that beginning to intermediate levels of play are attained. Enrollment is open to all students. Total limited to 12 units of credit earned in basic instructional KINE courses (KINE 100-176) for non-majors. The following restrictions apply to KINE 100-176: 1) no more than two different activity courses or more than one section of an individual activity course may be taken for credit in any one quarter, 2) a student may not enroll simultaneously in the same quarter for a beginning, intermediate and/or advanced activity course, and 3) any level of an activity course can be repeated only once for credit. Total credit limited to 2 units. Credit/No Credit grading only. 1 activity.\n',
        addl: 'Term Typically Offered: F, SP\nCR/NC\n',
        gwrCourse: false,
        uscpCourse: false,
        dynamicTerms: null
      }
    ];

    expect(
      cloneAndDeleteNestedProperty(generateCourseCacheFlowchart(flow1), 'dynamicTerms')
    ).toStrictEqual(cloneAndDeleteNestedProperty(expectedCourseCache, 'dynamicTerms'));
  });
});

describe('generateUserCourseCache tests', () => {
  test('generate user course cache for user with no flowcharts', () => {
    const expectedCourseCache: CourseCache[] = apiDataConfig.apiData.catalogs.map((catalog) => ({
      catalog,
      courses: []
    }));

    expect(generateUserCourseCache([])).toStrictEqual(expectedCourseCache);
  });

  test('generate user course cache for user with one flowchart with empty course data', () => {
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
      version: CURRENT_FLOW_DATA_VERSION,
      importedId: null,
      publishedId: null
    };

    const expectedCourseCache: CourseCache[] = apiDataConfig.apiData.catalogs.map((catalog) => ({
      catalog,
      courses: []
    }));

    expect(generateUserCourseCache([flow1])).toStrictEqual(expectedCourseCache);
  });

  test('generate user course cache for user with one flowchart with oen catalog', () => {
    const flow1: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: '',
      notes: '',
      ownerId: '',
      programId: ['68be11b7-389b-4ebc-9b95-8997e7314497'],
      startYear: '',
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
      unitTotal: '',
      version: CURRENT_FLOW_DATA_VERSION,
      importedId: null,
      publishedId: null
    };

    const expectedCourseCache: CourseCache[] = apiDataConfig.apiData.catalogs.map((catalog) => ({
      catalog,
      courses:
        catalog !== '2015-2017'
          ? []
          : [
              {
                id: 'AGC301',
                catalog: '2015-2017',
                displayName: 'New Media Communication Strategies in Agriculture',
                units: '4',
                desc: 'Exploration and implementation of emerging new media communication strategies and technologies to convey information on important issues in agriculture to a global audience.  Focus on food and farming dialogues currently populating conversations about production agriculture.  Adaptation of different writing styles based on requirements of the various new media channels.  Analysis of metrics to measure level of engagement with desired audience.  3 lectures, 1 laboratory.\n',
                addl: 'Term Typically Offered: W\nPrerequisite: JOUR 205. Recommended: JOUR 203.\n',
                gwrCourse: false,
                uscpCourse: false,
                dynamicTerms: null
              },
              {
                id: 'AGB301',
                catalog: '2015-2017',
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
                catalog: '2015-2017',
                displayName: 'Public Relations',
                units: '4',
                desc: 'Overview of the history, growth and ongoing development of public relations as an information management function in a multicultural environment.  Public relations practices used in commercial and non-profit sectors, and firsthand application of public relations skills.  4 lectures.\n',
                addl: 'Term Typically Offered: F, W\nPrerequisite: Sophomore standing.\n',
                gwrCourse: false,
                uscpCourse: false,
                dynamicTerms: null
              }
            ]
    }));

    expect(
      cloneAndDeleteNestedProperty(generateUserCourseCache([flow1]), 'dynamicTerms')
    ).toStrictEqual(cloneAndDeleteNestedProperty(expectedCourseCache, 'dynamicTerms'));
  });

  test('generate user course cache for one flowchart with two catalogs', () => {
    const flow1: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: '',
      notes: '',
      ownerId: '',
      programId: ['68be11b7-389b-4ebc-9b95-8997e7314497', 'cb65784d-23d6-44a9-ae7a-03b4b50d5b36'],
      startYear: '',
      termData: [
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
      ],
      unitTotal: '',
      version: CURRENT_FLOW_DATA_VERSION,
      importedId: null,
      publishedId: null
    };

    const expectedCourseCache: CourseCache[] = apiDataConfig.apiData.catalogs.map((catalog) => ({
      catalog,
      courses: []
    }));

    const courseCache1517 = expectedCourseCache.find((cache) => cache.catalog === '2015-2017');
    const courseCache2226 = expectedCourseCache.find((cache) => cache.catalog === '2022-2026');
    if (!courseCache1517) {
      throw new Error('courseCache1517 should be defined');
    }
    if (!courseCache2226) {
      throw new Error('courseCache2226 should be defined');
    }

    courseCache1517.courses = [
      {
        id: 'AGC301',
        catalog: '2015-2017',
        displayName: 'New Media Communication Strategies in Agriculture',
        units: '4',
        desc: 'Exploration and implementation of emerging new media communication strategies and technologies to convey information on important issues in agriculture to a global audience.  Focus on food and farming dialogues currently populating conversations about production agriculture.  Adaptation of different writing styles based on requirements of the various new media channels.  Analysis of metrics to measure level of engagement with desired audience.  3 lectures, 1 laboratory.\n',
        addl: 'Term Typically Offered: W\nPrerequisite: JOUR 205. Recommended: JOUR 203.\n',
        gwrCourse: false,
        uscpCourse: false,
        dynamicTerms: null
      },
      {
        id: 'AGB301',
        catalog: '2015-2017',
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
        catalog: '2015-2017',
        displayName: 'Public Relations',
        units: '4',
        desc: 'Overview of the history, growth and ongoing development of public relations as an information management function in a multicultural environment.  Public relations practices used in commercial and non-profit sectors, and firsthand application of public relations skills.  4 lectures.\n',
        addl: 'Term Typically Offered: F, W\nPrerequisite: Sophomore standing.\n',
        gwrCourse: false,
        uscpCourse: false,
        dynamicTerms: null
      }
    ];

    courseCache2226.courses = [
      {
        id: 'KINE134',
        catalog: '2022-2026',
        displayName: 'Pickleball',
        units: '1',
        desc: 'Basic instruction in skill development, knowledge, and desirable attitudes toward physical activity. Fundamental pickleball skills, knowledge, and strategy such that beginning to intermediate levels of play are attained. Enrollment is open to all students. Total limited to 12 units of credit earned in basic instructional KINE courses (KINE 100-176) for non-majors. The following restrictions apply to KINE 100-176: 1) no more than two different activity courses or more than one section of an individual activity course may be taken for credit in any one quarter, 2) a student may not enroll simultaneously in the same quarter for a beginning, intermediate and/or advanced activity course, and 3) any level of an activity course can be repeated only once for credit. Total credit limited to 2 units. Credit/No Credit grading only. 1 activity.\n',
        addl: 'Term Typically Offered: F, SP\nCR/NC\n',
        gwrCourse: false,
        uscpCourse: false,
        dynamicTerms: null
      }
    ];

    expect(
      cloneAndDeleteNestedProperty(generateUserCourseCache([flow1]), 'dynamicTerms')
    ).toStrictEqual(cloneAndDeleteNestedProperty(expectedCourseCache, 'dynamicTerms'));
  });

  test('generate user course cache for user with two flowcharts', () => {
    const flow1: Flowchart = {
      hash: '',
      id: '',
      lastUpdatedUTC: new Date(),
      name: '',
      notes: '',
      ownerId: '',
      programId: ['68be11b7-389b-4ebc-9b95-8997e7314497'],
      startYear: '',
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
      unitTotal: '',
      version: CURRENT_FLOW_DATA_VERSION,
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
      programId: ['68be11b7-389b-4ebc-9b95-8997e7314497', 'cb65784d-23d6-44a9-ae7a-03b4b50d5b36'],
      startYear: '',
      termData: [
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
      ],
      unitTotal: '',
      version: CURRENT_FLOW_DATA_VERSION,
      importedId: null,
      publishedId: null
    };

    const expectedCourseCache: CourseCache[] = apiDataConfig.apiData.catalogs.map((catalog) => ({
      catalog,
      courses: []
    }));

    const courseCache1517 = expectedCourseCache.find((cache) => cache.catalog === '2015-2017');
    const courseCache2226 = expectedCourseCache.find((cache) => cache.catalog === '2022-2026');
    if (!courseCache1517) {
      throw new Error('courseCache1517 should be defined');
    }
    if (!courseCache2226) {
      throw new Error('courseCache2226 should be defined');
    }

    courseCache1517.courses = [
      {
        id: 'AGC301',
        catalog: '2015-2017',
        displayName: 'New Media Communication Strategies in Agriculture',
        units: '4',
        desc: 'Exploration and implementation of emerging new media communication strategies and technologies to convey information on important issues in agriculture to a global audience.  Focus on food and farming dialogues currently populating conversations about production agriculture.  Adaptation of different writing styles based on requirements of the various new media channels.  Analysis of metrics to measure level of engagement with desired audience.  3 lectures, 1 laboratory.\n',
        addl: 'Term Typically Offered: W\nPrerequisite: JOUR 205. Recommended: JOUR 203.\n',
        gwrCourse: false,
        uscpCourse: false,
        dynamicTerms: null
      },
      {
        id: 'AGB301',
        catalog: '2015-2017',
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
        catalog: '2015-2017',
        displayName: 'Public Relations',
        units: '4',
        desc: 'Overview of the history, growth and ongoing development of public relations as an information management function in a multicultural environment.  Public relations practices used in commercial and non-profit sectors, and firsthand application of public relations skills.  4 lectures.\n',
        addl: 'Term Typically Offered: F, W\nPrerequisite: Sophomore standing.\n',
        gwrCourse: false,
        uscpCourse: false,
        dynamicTerms: null
      }
    ];

    courseCache2226.courses = [
      {
        id: 'KINE134',
        catalog: '2022-2026',
        displayName: 'Pickleball',
        units: '1',
        desc: 'Basic instruction in skill development, knowledge, and desirable attitudes toward physical activity. Fundamental pickleball skills, knowledge, and strategy such that beginning to intermediate levels of play are attained. Enrollment is open to all students. Total limited to 12 units of credit earned in basic instructional KINE courses (KINE 100-176) for non-majors. The following restrictions apply to KINE 100-176: 1) no more than two different activity courses or more than one section of an individual activity course may be taken for credit in any one quarter, 2) a student may not enroll simultaneously in the same quarter for a beginning, intermediate and/or advanced activity course, and 3) any level of an activity course can be repeated only once for credit. Total credit limited to 2 units. Credit/No Credit grading only. 1 activity.\n',
        addl: 'Term Typically Offered: F, SP\nCR/NC\n',
        gwrCourse: false,
        uscpCourse: false,
        dynamicTerms: null
      }
    ];

    expect(
      cloneAndDeleteNestedProperty(generateUserCourseCache([flow1, flow2]), 'dynamicTerms')
    ).toStrictEqual(cloneAndDeleteNestedProperty(expectedCourseCache, 'dynamicTerms'));
  });
});
