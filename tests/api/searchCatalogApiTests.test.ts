import { expect, test } from '@playwright/test';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginBackend } from '$test/util/userTestUtil';

test.describe('searchCatalog API tests', () => {
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString('pfb_test_searchCatalogAPI_playwright@test.com', testInfo);
    await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(userEmail);
  });

  test('fetch results in 400 without authentication', async ({ request }) => {
    const res = await request.get('/api/data/queryCourseCatalog');

    const expectedResponseBody = {
      message: 'Request was unauthenticated. Please authenticate and try again.'
    };

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('empty catalog search request fails', async ({ request }) => {
    // perform login
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get('/api/data/queryCourseCatalog');

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
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(`/api/data/queryCourseCatalog?catalog=invalid&query=test`);

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
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(
      `/api/data/queryCourseCatalog?${new URLSearchParams({
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
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(
      `/api/data/queryCourseCatalog?${new URLSearchParams({
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
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(
      `/api/data/queryCourseCatalog?${new URLSearchParams({
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
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('valid catalog search request succeeds (search limit exceeded)', async ({ request }) => {
    // perform login
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(
      `/api/data/queryCourseCatalog?${new URLSearchParams({
        catalog: '2022-2026',
        query: 'data'
      }).toString()}`
    );

    const expectedResponseBody = {
      message: 'Catalog search request successful.',
      results: {
        searchResults: [
          {
            id: 'AGB260',
            catalog: '2022-2026',
            displayName: 'Agribusiness Data Literacy',
            units: '4',
            desc: 'Using data and analysis in making decisions related to agribusiness. Developing basic and intermediate spreadsheet skills necessary to organize, analyze, and summarize information. Development of data management and analysis as tools to assist in agribusiness problem-solving. Course may be offered in classroom-based, online, or hybrid format. 4 lectures.\n',
            addl: 'Term Typically Offered: F, W, SP\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: { termSummer: false, termFall: true, termWinter: true, termSpring: true }
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
            dynamicTerms: { termSummer: false, termFall: true, termWinter: true, termSpring: true }
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
          },
          {
            id: 'BMED505',
            catalog: '2022-2026',
            displayName: 'Biomedical Signal Transduction and Data Acquisition',
            units: '4',
            desc: 'Bridging the physical gap between biological and digital systems.  Physics of chemical, mechanical, electrical, thermal, and optical sensors relevant to biomedical engineering.  Evaluation of transducer performance and system design.  Includes realization of a transducer system relevant to graduate projects.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: SP\nPrerequisite: BMED 440.\n',
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
            id: 'BUS490',
            catalog: '2022-2026',
            displayName: 'Data Visualization',
            units: '4',
            desc: 'Fundamentals and practice of data visualization with an emphasis on storytelling within organizations.  Theoretical focus on human cognition and perception.  Application of principles through software tools.  4 lectures.\n',
            addl: 'Term Typically Offered: W, SP\nPrerequisite: BUS 497.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: { termSummer: false, termFall: false, termWinter: true, termSpring: true }
          },
          {
            id: 'BUS499',
            catalog: '2022-2026',
            displayName: 'Data Communications and Networking',
            units: '4',
            desc: 'Combines the fundamental concepts of data communications and networking with practical applications in business.  Provides a basic understanding of the technical and managerial aspects of business telecommunication.  Introduction to data communications and applications and technical fundamentals, and to network products, technologies, applications, and services.  4 lectures.\n',
            addl: 'Term Typically Offered: F, W\nPrerequisite: BUS 391; Business and Economics majors must declare their concentrations in order to enroll.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: { termSummer: false, termFall: true, termWinter: true, termSpring: false }
          },
          {
            id: 'CPE202',
            catalog: '2022-2026',
            displayName: 'Data Structures',
            units: '4',
            desc: 'Introduction to data structures and analysis of algorithms.  Abstract datatypes.  Specification and implementation of advanced data structures.  Theoretical and empirical analysis of recursive and iterative algorithms.  Software performance evaluation and testing techniques.  Not open to students with credit in CSC/CPE 108.  3 lectures, 1 laboratory.  Crosslisted as CPE/CSC 202.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: CPE/CSC 101 with a grade of C- or better; or consent of instructor.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: { termSummer: false, termFall: true, termWinter: true, termSpring: true }
          },
          {
            id: 'CSC202',
            catalog: '2022-2026',
            displayName: 'Data Structures',
            units: '4',
            desc: 'Introduction to data structures and analysis of algorithms.  Abstract datatypes.  Specification and implementation of advanced data structures.  Theoretical and empirical analysis of recursive and iterative algorithms.  Software performance evaluation and testing techniques.  Not open to students with credit in CSC/CPE 108.  3 lectures, 1 laboratory.  Crosslisted as CPE/CSC 202.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: CPE/CSC 101 with a grade of C- or better; or consent of instructor.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: { termSummer: false, termFall: true, termWinter: true, termSpring: true }
          },
          {
            id: 'CSC314',
            catalog: '2022-2026',
            displayName: 'Software Design and Data Structures for Educators',
            units: '4',
            desc: 'A programming-based introduction to software design techniques, data structures, and algorithms, appropriate for K-12 computer science teachers.  Satisfies a requirement for the computer science specific supplementary authorization for teaching K-12 computer science in California.  Course offered online only.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: SU\nPrerequisite: CSC 312.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: true,
              termFall: false,
              termWinter: false,
              termSpring: false
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
            dynamicTerms: { termSummer: false, termFall: true, termWinter: true, termSpring: true }
          },
          {
            id: 'CSC566',
            catalog: '2022-2026',
            displayName: 'Topics in Advanced Data Mining',
            units: '4',
            desc: 'Advanced topics in the areas of data mining, knowledge discovery in data, machine learning, information retrieval and intelligent analysis of information.  The Class Schedule will list topic selected.  Total credit limited to 8 units.  4 lectures.\n',
            addl: 'Term Typically Offered: TBD\nPrerequisite: CSC 466 or CSC 480 or CSC 582.\n',
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
            id: 'DATA100',
            catalog: '2022-2026',
            displayName: 'Data Science for All I',
            units: '4',
            desc: 'Basic approaches for answering questions using data.  Emphasis on working with tabular data in spreadsheet software to provide insights via descriptions and visualizations.  Methods of acquiring data.  Sampling bias, variability, and multi-variable thinking.  Introduction to data modeling and data ethics.  Intended for students in non-computing disciplines.  Not open to students with credit in STAT 150, STAT 252, STAT 302, STAT 312, or STAT 313.  Course may be offered in a classroom-based, online, or hybrid format.  4 lectures.  Fulfills GE Area B4 (GE Area B1 for students on the 2019-20 or earlier catalogs); a grade of C- or better is required in one course in this GE area.\n',
            addl: 'Term Typically Offered: F, W, SP\n2020-21 or later catalog: GE Area B4\n2019-20 or earlier catalog: GE Area B4\nPrerequisite: MATH 115, MATH 116, MATH 118, or Appropriate Math Placement Level.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: { termSummer: false, termFall: true, termWinter: true, termSpring: true }
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
            dynamicTerms: { termSummer: false, termFall: true, termWinter: true, termSpring: true }
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
            dynamicTerms: { termSummer: false, termFall: true, termWinter: true, termSpring: true }
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
            dynamicTerms: { termSummer: false, termFall: true, termWinter: false, termSpring: true }
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
            dynamicTerms: { termSummer: false, termFall: true, termWinter: true, termSpring: false }
          }
        ],
        searchLimitExceeded: true,
        searchValid: true
      }
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('valid catalog search request succeeds (random term, no results)', async ({ request }) => {
    // perform login
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(
      `/api/data/queryCourseCatalog?${new URLSearchParams({
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
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('valid catalog search request succeeds (using id field)', async ({ request }) => {
    // perform login
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(
      `/api/data/queryCourseCatalog?${new URLSearchParams({
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
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
});
