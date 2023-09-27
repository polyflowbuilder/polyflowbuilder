import { expect, test } from '@playwright/test';
import { performLoginBackend } from 'tests/util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';
import type { APICourseFull } from '$lib/types';

const SEARCH_CATALOG_API_TESTS_EMAIL = 'pfb_test_searchCatalogAPI_playwright@test.com';

// TODO: tests nondeterministic ordering for searchResults - should this be deterministic?
function validateSearchResults(
  expected: {
    message: string;
    results: {
      searchResults: APICourseFull[];
      searchLimitExceeded: boolean;
      searchValid: boolean;
    };
  },
  actualRawJSON: Record<string, unknown>
) {
  // expected
  const { searchResults: expectedSearchResults, ...expectedResults } = expected.results;
  const expectedResponseBodyWithoutSearchResults = {
    ...expected,
    results: expectedResults
  };

  // actual
  const { searchResults: actualSearchResults, ...actualResults } = actualRawJSON.results as {
    searchResults: unknown[];
  };
  const actualResponseBodyWithoutSearchResults = {
    ...actualRawJSON,
    results: actualResults
  };

  // everything but search results
  expect(actualResponseBodyWithoutSearchResults).toStrictEqual(
    expectedResponseBodyWithoutSearchResults
  );

  // search results
  for (const result of expectedSearchResults) {
    expect(actualSearchResults).toContainEqual(result);
  }
  expect(actualSearchResults).toHaveLength(expectedSearchResults.length);
}

test.describe('searchCatalog API tests', () => {
  test.beforeAll(async () => {
    // create account
    await createUser({
      email: SEARCH_CATALOG_API_TESTS_EMAIL,
      username: 'test',
      password: 'test'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(SEARCH_CATALOG_API_TESTS_EMAIL);
  });

  test('fetch results in 400 without authentication', async ({ request }) => {
    const res = await request.get('/api/data/searchCatalog');

    const expectedResponseBody = {
      message: 'Request was unauthenticated. Please authenticate and try again.'
    };

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('empty catalog search request fails', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.get('/api/data/searchCatalog');

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        catalog: ['Catalog is required.'],
        query: ['Query field for catalog search is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('invalid catalog for catalog search request fails', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.get(`/api/data/searchCatalog?catalog=invalid&query=test`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        catalog: ['Invalid catalog format.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('invalid query for catalog search request fails', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.get(
      `/api/data/searchCatalog?${new URLSearchParams({
        catalog: '2015-2017',
        query: '++data'
      }).toString()}`
    );

    const expectedResponseBody = {
      message: 'The search query is invalid.'
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('invalid field for catalog search request fails', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.get(
      `/api/data/searchCatalog?${new URLSearchParams({
        catalog: '2015-2017',
        query: 'test',
        field: 'invalid'
      }).toString()}`
    );

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        field: ["Invalid enum value. Expected 'id' | 'displayName', received 'invalid'"]
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('valid catalog search request succeeds (search limit not exceeded)', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.get(
      `/api/data/searchCatalog?${new URLSearchParams({
        catalog: '2022-2026',
        query: 'Bowling'
      }).toString()}`
    );

    const expectedResponseBody = {
      message: 'Catalog search request successful.',
      results: {
        searchResults: [
          {
            id: 'KINE109',
            catalog: '2022-2026',
            displayName: 'Bowling',
            units: '1',
            desc: 'Basic instruction in skill development, knowledge, and desirable attitudes toward physical activity. Enrollment is open to all students. Total limited to 12 units of credit earned in basic instructional KINE courses (KINE 100-176) for non-majors. The following restrictions apply to KINE 100-176: 1) no more than two different activity courses or more than one section of an individual activity course may be taken for credit in any one quarter, 2) a student may not enroll simultaneously in the same quarter for a beginning, intermediate and/or advanced activity course, and 3) any level of an activity course can be repeated only once for credit. Total credit limited to 2 units. Credit/No Credit grading only. 1 activity.\n',
            addl: 'Term Typically Offered: F, W, SP\nCR/NC\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'KINE112',
            catalog: '2022-2026',
            displayName: 'Intermediate Bowling',
            units: '1',
            desc: 'Basic instruction and the development of skill, knowledge of rules, background and analysis of techniques, and desirable attitudes toward physical fitness and participation in physical activities.  Enrollment is open to all students.  Total limited to 12 units of credit earned in basic instructional KINE courses (KINE 100-176) for non-majors.  The following restrictions apply to KINE 100-176:  1) no more than two different activity courses nor more than one section of an individual activity course may be taken for credit in any one quarter, 2) a student may not enroll simultaneously in the same quarter for a beginning, intermediate and/or advanced activity course, and 3) any level of an activity course can be repeated only once for credit.  Total credit limited to 2 units.  Credit/No Credit grading only.  1 activity.\n',
            addl: 'Term Typically Offered: F, W, SP\nCR/NC\nPrerequisite: KINE 109.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          }
        ],
        searchLimitExceeded: false,
        searchValid: true
      }
    };

    expect(res.status()).toBe(200);
    validateSearchResults(expectedResponseBody, (await res.json()) as Record<string, unknown>);
  });

  test('valid catalog search request succeeds (search limit exceeded)', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.get(
      `/api/data/searchCatalog?${new URLSearchParams({
        catalog: '2022-2026',
        query: 'data'
      }).toString()}`
    );

    const expectedResponseBody = {
      message: 'Catalog search request successful.',
      results: {
        searchResults: [
          {
            id: 'IME312',
            catalog: '2022-2026',
            displayName: 'Data Management and System Design',
            units: '4',
            desc: 'Design and management of industrial databases and reporting systems.  Relationships of financial accounting databases and production systems.  Efficient data entry and reports, queries, macro function, and Internet based database applications.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: CSC 232.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'ECON519',
            catalog: '2022-2026',
            displayName: 'Econometrics and Data Analysis',
            units: '4',
            desc: 'Identification and estimation of linear and nonlinear regression models for analyzing business data.  Topics include multiple linear regression; model selection; robust standard errors; instrumental variables; maximum likelihood estimation; logit/probit, ordered logit/probit, and other microeconometric models.  4 lectures.\n',
            addl: 'Term Typically Offered: F\nPrerequisite: GSE 518. Corequisite: GSE 524.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: false,
              termSpring: false
            }
          },
          {
            id: 'ESCI502',
            catalog: '2022-2026',
            displayName: 'Research Methods and Data Analysis',
            units: '4',
            desc: 'Quantitative and qualitative survey of research methods for environmental science and management including research design, sampling, data collection, analysis, and interpretation.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: W\nPrerequisite: Graduate standing or consent of instructor; ESCI 501; and STAT 217.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: true,
              termSpring: false
            }
          },
          {
            id: 'GRC404',
            catalog: '2022-2026',
            displayName: 'Data Management, Estimating and Visualization in Graphic Communication',
            units: '4',
            desc: 'Cost estimating of graphic communication products and data services.  Study of data sources and entity relationship design.  Exploration, uses, analysis and visualization of data used in digital advertising, marketing, graphic communications operations and finance.  Course may be offered in classroom-based or online format.  3 lectures, 1 laboratory.  Formerly GRC 403.\n',
            addl: 'Term Typically Offered: F, W\nPrerequisite: Junior standing and GRC 328; Graphic Communication majors only.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: false
            }
          },
          {
            id: 'GSB510',
            catalog: '2022-2026',
            displayName: 'Data Visualization and Communication in Business',
            units: '4',
            desc: 'Principles of data visualization and storytelling.  Data visualization tools for different types of data in the context of business analytics.  Communication of results for business actionable insights.  Software use includes Excel, Tableau and R.  Course may be offered in classroom-based, online, or hybrid format.  4 lectures.\n',
            addl: 'Term Typically Offered: F\nPrerequisite: OCOB graduate standing or approval from the Associate Dean.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: false,
              termSpring: false
            }
          },
          {
            id: 'GSB520',
            catalog: '2022-2026',
            displayName: 'Data Management for Business Analytics',
            units: '4',
            desc: 'Exploration of data management including relational databases, data warehouses, and NOSQL databases.  Foundation for analyzing, designing, implementing and using information repositories in a business environment.  Topics include the database development life cycle, data modeling, SQL programming, data quality and integration.  Course may be offered in classroom-based, online, or hybrid format.  4 lectures.\n',
            addl: 'Term Typically Offered: F\nPrerequisite: OCOB graduate standing or approval from the Associate Dean.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: false,
              termSpring: false
            }
          },
          {
            id: 'GSB530',
            catalog: '2022-2026',
            displayName: 'Data Analytics and Mining for Business',
            units: '4',
            desc: 'Exploration of the concepts, tools and techniques of data mining in the business context, using case study and problem-solving approaches.  Topics include multidimensional data modeling, predictive analytics, pattern discovery, forecasting, text mining, and data visualization.  Course may be offered in classroom-based, online, or hybrid format.  4 lectures.\n',
            addl: 'Term Typically Offered: W\nPrerequisite: OCOB graduate standing or approval from the Associate Dean.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: true,
              termSpring: false
            }
          },
          {
            id: 'GSB536',
            catalog: '2022-2026',
            displayName: 'Data Ethics for Business Analytics',
            units: '2',
            desc: 'Examination of ethical risks raised by data analysis, including data collection, ownership and usage.  Philosophical examination of topics raised by data analysis, including consent, privacy, transparency, bias and potential harms from data collection and use.  Course may be offered in classroom-based, online, or hybrid format.  2 lectures.\n',
            addl: 'Term Typically Offered: SP\nPrerequisite: GSB 520; and OCOB graduate standing or approval from the Associate Dean.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: false,
              termSpring: true
            }
          },
          {
            id: 'GSB575',
            catalog: '2022-2026',
            displayName: 'Career Readiness in Data Analytics',
            units: '1',
            desc: 'Career development and preparation with specific focus on the impact of organizational structures on the professions of business analytics and data science.  Personal marketing in a dynamic technological environment.  Course may be offered in classroom-based or online format.  1 lecture.\n',
            addl: 'Term Typically Offered: W\nPrerequisite: OCOB graduate standing or approval from the Associate Dean.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: true,
              termSpring: false
            }
          },
          {
            id: 'GSE519',
            catalog: '2022-2026',
            displayName: 'Econometrics and Data Analysis',
            units: '4',
            desc: 'Identification and estimation of linear and nonlinear regression models for analyzing business data.  Topics include multiple linear regression; model selection; robust standard errors; instrumental variables; maximum likelihood estimation; logit/probit, ordered logit/probit, and other microeconometric models.  Course may be offered in classroom-based, online, or hybrid format.  4 lectures.\n',
            addl: 'Term Typically Offered: F\nPrerequisite: GSB 518 or GSE 518. Corequisite: GSB 544 or GSE 524.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: false,
              termSpring: false
            }
          },
          {
            id: 'ECON202',
            catalog: '2022-2026',
            displayName: 'Using Big Data to Solve Economic and Social Problems',
            units: '4',
            desc: 'Introduction to basic methods in empirical economic analysis, including regression, causal inference, and machine learning. Applications of the methods to equality of opportunity, education, racial disparities, innovation and entrepreneurship, health care, climate change, criminal justice, and tax policy. Course may be offered in classroom-based or hybrid format. 4 lectures.\n',
            addl: 'Term Typically Offered: F, SP\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: false,
              termSpring: true
            }
          },
          {
            id: 'IME565',
            catalog: '2022-2026',
            displayName: 'Predictive Data Analytics for Engineers',
            units: '4',
            desc: 'Applications of predictive data analytics to enhance the performance of engineering systems, processes, and products.  Data processing, analysis, and visualization.  Supervised and unsupervised learning.  Ensemble learning, random forests, support vector machines, neural networks, and clustering.  Model biases and data ethics.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: F\nPrerequisite: IME 372 or DATA 301 and graduate standing; or consent of instructor. Recommended: IME 326, MATH 206, or MATH 244; and STAT 302 or STAT 312.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: false,
              termSpring: false
            }
          },
          {
            id: 'JOUR350',
            catalog: '2022-2026',
            displayName: 'Data Journalism',
            units: '4',
            desc: 'Introduction to the techniques of finding stories in data sets and presenting them visually via interactive online displays.  Emphasis on adapting emerging tools for digital storytelling.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: W, SP\nPrerequisite: JOUR 285; and one of the following: STAT 130, STAT 217, STAT 218, or STAT 251.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'LA317',
            catalog: '2022-2026',
            displayName: 'The World of Spatial Data and Geographic Information Technology',
            units: '4',
            desc: 'Foundation for understanding the world through geographic information as well as the tools available to utilize spatial data.  Experience with Geographic Information Systems (GIS) and related technology.  Not open to students with credit in GEOG 218 or LA/NR 218.  3 lectures, 1 activity.  Crosslisted as LA/NR 317.  Fulfills GE Area Upper-Division B (GE Areas B5, B6, or B7 for students on the 2019-20 catalog).\n',
            addl: 'Term Typically Offered: F, W, SP\n2020-21 or later: Upper-Div GE Area B\n2019-20 or earlier catalog: GE Area B5, B6, or B7\nPrerequisite: Junior standing; completion of GE Area A with grades of C- or better; and completion of GE Areas B1 through B4, with a grade of C- or better in one course in GE Area B4 (GE Area B1 for students on the 2019-20 or earlier catalogs).\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'ME236',
            catalog: '2022-2026',
            displayName: 'Measurement and Engineering Data Analysis',
            units: '3',
            desc: 'Introduction to principles and practice of measurement.  Application of probability distributions, sampling, confidence intervals, uncertainty, and regression analysis to engineering experiments and design.  Techniques for measuring common physical quantities such as temperature, pressure, and strain.  Introduction to laboratory report writing and communication of technical data.  2 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: Engineering majors. Recommended: CHEM 125, ENGL 149, and PHYS 132 or PHYS 142.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'NR317',
            catalog: '2022-2026',
            displayName: 'The World of Spatial Data and Geographic Information Technology',
            units: '4',
            desc: 'Foundation for understanding the world through geographic information as well as the tools available to utilize spatial data.  Experience with Geographic Information Systems (GIS) and related technology.  Not open to students with credit in GEOG 218 or LA/NR 218.  3 lectures, 1 activity.  Crosslisted as LA/NR 317.  Fulfills GE Area Upper-Division B (GE Areas B5, B6, or B7 for students on the 2019-20 catalog).\n',
            addl: 'Term Typically Offered: TBD\n2020-21 or later: Upper-Div GE Area B\n2019-20 or earlier catalog: GE Area B5, B6, or B7\nPrerequisite: Junior standing; completion of GE Area A with grades of C- or better; and completion of GE Areas B1 through B4, with a grade of C- or better in one course in GE Area B4 (GE Area B1 for students on the 2019-20 or earlier catalogs).\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: false,
              termSpring: false
            }
          },
          {
            id: 'POLS361',
            catalog: '2022-2026',
            displayName: 'Data Analysis in Political Science',
            units: '4',
            desc: 'Survey of data analysis in political science, up to and including multiple regression.  Software instruction to facilitate understanding of quantitative approaches to political research.  4 lectures.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: POLS 359.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'RPTA416',
            catalog: '2022-2026',
            displayName: 'Interpreting Experience Industry Data Analytics',
            units: '4',
            desc: 'Interpretation of data and metrics used in the experience industry.  Exploration of methods to measure customer experiences and translate data into strategic decisions.  Analytics software (CRM, PowerBI) will be used to visualize datasets.  Techniques for interpreting datasets and building compelling presentations.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: RPTA 360.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'STAT418',
            catalog: '2022-2026',
            displayName: 'Categorical Data Analysis',
            units: '4',
            desc: 'Discrete multivariate statistics, including analysis of cross-classified data, log-linear models for multidimensional contingency tables, goodness of fit statistics, measures of association, model selection, and hypothesis testing.  4 lectures.\n',
            addl: 'Term Typically Offered: W\nPrerequisite: STAT 324 or STAT 334 or STAT 524.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: true,
              termSpring: false
            }
          },
          {
            id: 'WVIT346',
            catalog: '2022-2026',
            displayName: 'Winery Digital Media Marketing and Data Analytics',
            units: '4',
            desc: 'Development of digital marketing skills (audio and video) and techniques to produce content for wineries and evaluate results.  Emphasis on regulatory restrictions in wine marketing, return on investment strategy, optimization and analytic metrics and customer acquisition costs.  Course may be offered in classroom-based or online format.  4 lectures.\n',
            addl: 'Term Typically Offered: SP\nPrerequisite: AGB 260 and WVIT 343.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: false,
              termSpring: true
            }
          },
          {
            id: 'CSC466',
            catalog: '2022-2026',
            displayName: 'Knowledge Discovery from Data',
            units: '4',
            desc: 'Overview of modern knowledge discovery from data (KDD) methods and technologies.  Topics in data mining (association rules mining, classification, clustering), information retrieval, web mining.  Emphasis on use of KDD techniques in modern software applications.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: CSC 349 and one of the following: STAT 252, STAT 302, STAT 312, STAT 321 or STAT 350.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'AGB327',
            catalog: '2022-2026',
            displayName: 'Agribusiness Data Analysis',
            units: '4',
            desc: 'Methods in agricultural business data analysis, including multiple regression analysis, analysis of variance, and time series analysis.  Applications include agricultural price forecasting and estimation of the determinants of food and fiber demand.  3 lectures, 1 activity.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: STAT 251 and AGB 260.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'AGB427',
            catalog: '2022-2026',
            displayName: 'Advanced Agribusiness Data Analysis',
            units: '4',
            desc: 'Advanced topics in agricultural business data analysis.  Topics include advanced agricultural price analysis, advanced linear programming in agribusiness, and advanced agricultural business operations analysis.  The Class Schedule will list topic selected.  4 lectures.\n',
            addl: 'Term Typically Offered: TBD\nPrerequisite: AGB 327 or AGB 328 or graduate standing and consent of instructor.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: false,
              termSpring: false
            }
          },
          {
            id: 'BIO562',
            catalog: '2022-2026',
            displayName: 'Data Management and Visualization in Biology',
            units: '3',
            desc: 'Data management and visualization tools for research.  Introduction to data management in menu driven applications.  Extensive work with data management in code-driven applications.  Advanced visualization techniques for data presentation and publication.  3 seminars.\n',
            addl: 'Term Typically Offered: F\nPrerequisite: STAT 218 and graduate standing in Biological Sciences; or consent of instructor. Recommended: Experience with Excel and R.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: false,
              termSpring: false
            }
          }
        ],
        searchLimitExceeded: true,
        searchValid: true
      }
    };

    expect(res.status()).toBe(200);
    validateSearchResults(expectedResponseBody, (await res.json()) as Record<string, unknown>);
  });

  test('valid catalog search request succeeds (random term, no results)', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.get(
      `/api/data/searchCatalog?${new URLSearchParams({
        catalog: '2022-2026',
        query: 'askldfmvklsdmvklsfmvklsdfmvlksdmvkl'
      }).toString()}`
    );

    const expectedResponseBody = {
      message: 'Catalog search request successful.',
      results: {
        searchResults: [],
        searchLimitExceeded: false,
        searchValid: true
      }
    };

    expect(res.status()).toBe(200);
    validateSearchResults(expectedResponseBody, (await res.json()) as Record<string, unknown>);
  });

  test('valid catalog search request succeeds (using id field)', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.get(
      `/api/data/searchCatalog?${new URLSearchParams({
        catalog: '2022-2026',
        query: 'data*',
        field: 'id'
      }).toString()}`
    );

    const expectedResponseBody = {
      message: 'Catalog search request successful.',
      results: {
        searchResults: [
          {
            id: 'DATA100',
            catalog: '2022-2026',
            displayName: 'Data Science for All I',
            units: '4',
            desc: 'Basic approaches for answering questions using data.  Emphasis on working with tabular data in spreadsheet software to provide insights via descriptions and visualizations.  Methods of acquiring data.  Sampling bias, variability, and multi-variable thinking.  Introduction to data modeling and data ethics.  Intended for students in non-computing disciplines.  Not open to students with credit in STAT 150, STAT 252, STAT 302, STAT 312, or STAT 313.  Course may be offered in a classroom-based, online, or hybrid format.  4 lectures.  Fulfills GE Area B4 (GE Area B1 for students on the 2019-20 or earlier catalogs); a grade of C- or better is required in one course in this GE area.\n',
            addl: 'Term Typically Offered: F, W, SP\n2020-21 or later catalog: GE Area B4\n2019-20 or earlier catalog: GE Area B4\nPrerequisite: MATH 115, MATH 116, MATH 118, or Appropriate Math Placement Level.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'DATA301',
            catalog: '2022-2026',
            displayName: 'Introduction to Data Science',
            units: '4',
            desc: 'Introduction to the field of data science and the workflow of a data scientist.  Types of data (tabular, textual, sparse, structured, temporal, geospatial), basic data management and manipulation, simple summaries, and visualization.  Course may be offered in classroom-based, online, or hybrid format.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: CPE/CSC 202; and one of the following: IME 326, STAT 302, STAT 312, or STAT 313.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          },
          {
            id: 'DATA401',
            catalog: '2022-2026',
            displayName: 'Data Science Process and Ethics',
            units: '3',
            desc: 'Complete life cycle of a data science project.  Requirements engineering and data acquisition.  Management and integration of data of high volume, velocity, and variety.  Deployment of data science products.  Engagement with stakeholders.  Ethical considerations, including privacy and fairness.  3 lectures.\n',
            addl: 'Term Typically Offered: F\nPrerequisites: DATA 301; CSC 365; and CSC 466. Concurrent: DATA 402 and DATA 403.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: false,
              termSpring: false
            }
          },
          {
            id: 'DATA402',
            catalog: '2022-2026',
            displayName: 'Mathematical Foundations of Data Science',
            units: '3',
            desc: 'Mathematical foundations of machine learning and data science.  Principle of maximum likelihood.  Inferential and predictive modeling and their comparison.  Optimization techniques.  Linear regression and linear classifiers.  Mathematical foundations of neural networks and neural network analysis.  Dimensionality reduction and its use in supervised and unsupervised learning.  3 lectures.\n',
            addl: 'Term Typically Offered: F\nPrerequisites: CSC 466; DATA 301; and STAT 334. Concurrent: DATA 401 and DATA 403.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: false,
              termSpring: false
            }
          },
          {
            id: 'DATA403',
            catalog: '2022-2026',
            displayName: 'Data Science Projects Laboratory',
            units: '1',
            desc: 'Project-based lab component of DATA 401 and DATA 402.  Projects involving comparison of predictive and interpretable regression models, implementing linear classifiers with gradient descent, implementing neural networks from scratch, and deep learning.  1 laboratory.\n',
            addl: 'Term Typically Offered: F\nConcurrent: DATA 401 and DATA 402.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: false,
              termSpring: false
            }
          },
          {
            id: 'DATA441',
            catalog: '2022-2026',
            displayName: 'Bioinformatics Capstone I',
            units: '2',
            desc: 'Working with clients to design bioinformatics solutions to biological questions.  Software requirements, elicitation techniques, data gathering, project planning, and project team organization.  Ethics and professionalism.  2 laboratories.\n',
            addl: 'Term Typically Offered: W\nPrerequisite: BIO 351 or CHEM 373; BIO 441 or CSC 448; DATA 301.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: true,
              termSpring: false
            }
          },
          {
            id: 'DATA442',
            catalog: '2022-2026',
            displayName: 'Bioinformatics Capstone II',
            units: '2',
            desc: 'Continue projects initiated in DATA 441.  Team-based design, implementation of bioinformatics solutions and management of development teams.  Technical documentation, quality assurance, and systems testing.  Design and conduct empirical studies.  Data visualization.  Oral and written presentation.  2 laboratories.\n',
            addl: 'Term Typically Offered: SP\nPrerequisite: DATA 441.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: false,
              termSpring: true
            }
          },
          {
            id: 'DATA451',
            catalog: '2022-2026',
            displayName: 'Data Science Capstone I',
            units: '2',
            desc: 'Working with clients to develop data-driven solutions for systems to be constructed in DATA 452.  Specification and design requirements, elicitation techniques, research and data gathering methods; project planning, time and budget estimating; project team organization.  Ethics and professionalism.  2 laboratories.\n',
            addl: 'Term Typically Offered: W\nPrerequisite: DATA 401.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: true,
              termSpring: false
            }
          },
          {
            id: 'DATA452',
            catalog: '2022-2026',
            displayName: 'Data Science Capstone II',
            units: '2',
            desc: 'Team-based design, implementation, deployment and delivery of a system or analytical methodology that involves working with and analyzing large quantities of data.  Technical management of research and development teams.  Technical documentation, quality assurance, integration and systems testing.  Design and conduct of empirical studies.  Visualization and presentation of results orally and in writing.  2 laboratories.\n',
            addl: 'Term Typically Offered: SP\nPrerequisite: DATA 451.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: false,
              termSpring: true
            }
          },
          {
            id: 'DATA472',
            catalog: '2022-2026',
            displayName: 'Data Science Seminar',
            units: '1',
            desc: 'Discussions of technical, societal and ethical aspects of modern data science theory and practice, concentrating on topics not covered in other courses.  1 seminar.  Total credit limited to 4 units.  Credit/No credit grading only.\n',
            addl: 'Term Typically Offered: F, W, SP\nCR/NC\nPrerequisite: DATA 301.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: true,
              termWinter: true,
              termSpring: true
            }
          }
        ],
        searchLimitExceeded: false,
        searchValid: true
      }
    };

    expect(res.status()).toBe(200);
    validateSearchResults(expectedResponseBody, (await res.json()) as Record<string, unknown>);
  });
});
