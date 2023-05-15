import { expect, test } from '@playwright/test';
import { performLoginBackend } from '../util/userTestUtil.js';
import { createUser, deleteUser } from '$lib/server/db/user';

const SEARCH_CATALOG_API_TESTS_EMAIL = 'pfb_test_searchCatalogAPI_playwright@test.com';

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
    const res = await request.post('/api/data/searchCatalog');

    const expectedResponseBody = {
      message: 'Request was unauthenticated. Please authenticate and try again.'
    };

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('empty catalog search request fails', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.post('/api/data/searchCatalog', {
      data: {}
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        catalog: ['Catalog field for catalog search is required.'],
        query: ['Query field for catalog search is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('invalid catalog for catalog search request fails', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.post('/api/data/searchCatalog', {
      data: {
        catalog: 'invalid',
        query: 'test'
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        catalog: ['Catalog field for catalog search is invalid, received invalid.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('valid catalog search request succeeds (search limit exceeded)', async ({ request }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.post('/api/data/searchCatalog', {
      data: {
        catalog: '2022-2026',
        query: 'Bowling'
      }
    });

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
          },
          {
            id: 'EDUC423',
            catalog: '2022-2026',
            displayName: 'Bilingual Literacy',
            units: '4',
            desc: 'Patterns of classroom organization, application of reading programs, approaches, methods in English and Spanish, and supervised field experiences in elementary classrooms with bilingual students.  Course may be offered in classroom-based or online format.  3 seminars, 1 activity.\n',
            addl: 'Term Typically Offered: W\nPrerequisite: Admission to the Spanish Authorization for Bilingual Educators (SABE) Program.\n',
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
            id: 'CHEM372',
            catalog: '2022-2026',
            displayName: 'Metabolism',
            units: '4',
            desc: 'Intermediary metabolism of carbohydrates, lipids, amino acids and nucleotides, regulation and integration of metabolic pathways, bioenergetics, photosynthesis, electron transport, nitrogen fixation, biochemical function of vitamins and minerals.  4 lectures.\n',
            addl: 'Term Typically Offered: F, SP\nPrerequisite: CHEM 369 or CHEM 371.\n',
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
            id: 'KINE110',
            catalog: '2022-2026',
            displayName: 'Cycling',
            units: '1',
            desc: 'Basic instruction in skill development, knowledge, and desirable attitudes while engaging in cycling in outdoor settings. Enrollment is open to all students. Total limited to 12 units of credit earned in basic instructional KINE courses (KINE 100-176) for non-majors. The following restrictions apply to KINE 100-176: 1) no more than two different activity courses or more than one section of an individual activity course may be taken for credit in any one quarter, 2) any level of an activity course can be repeated only once for credit. Total credit limited to 2 units. Credit/No Credit grading only. 1 activity.\n',
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
            id: 'KINE125',
            catalog: '2022-2026',
            displayName: 'Jogging',
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
            id: 'PEM196',
            catalog: '2022-2026',
            displayName: 'Wrestling',
            units: '2',
            desc: 'Enrollment limited to those academically qualified to compete in intercollegiate athletic programs. Consent of coach required. Total credit limited to 8 units. Courses are each 2 units and meet for a minimum of 10 hours per week. All competitive athletics courses are evaluated on a Credit/No Credit basis.\n',
            addl: 'Term Typically Offered: TBD\nCR/NC\n',
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
            id: 'FSN346',
            catalog: '2022-2026',
            displayName: 'Brewing Methods',
            units: '3',
            desc: 'Introduction to brewing practices and hands-on instruction on industry standard laboratory methods for the analysis of barley, malt, hops, water, yeast, and beer.  Perform pilot brews and apply methodologies for the analysis of raw ingredients, process control, and final product.  Field trip required.  1 lecture, 2 laboratories.  Students must be 18 years of age or older.\n',
            addl: 'Term Typically Offered: TBD\nPrerequisite: FSN 342.\n',
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
            id: 'FPE504',
            catalog: '2022-2026',
            displayName: 'Fire Modeling',
            units: '4',
            desc: 'Fire modeling techniques for fire safety assessment.  Application of various engineering correlations and computer-based fire models, including zone models and computational fluid dynamics models, to representative fire problems.  4 lectures.\n',
            addl: 'Term Typically Offered: SU\nPrerequisite: FPE 502, FPE 503.\n',
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
            id: 'JOUR334',
            catalog: '2022-2026',
            displayName: 'Editing',
            units: '4',
            desc: 'Editing for print and online publication.  Using the Associated Press style.  Writing headlines, captions, summaries and other display text.  Repurposing various media content for the web and other formats.  Legal and ethical issues for the editor.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: JOUR 203.\n',
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
            id: 'FSN342',
            catalog: '2022-2026',
            displayName: 'Brewing Science',
            units: '4',
            desc: 'Scientific principles of malting and brewing.  Chemistry, microbiology, and technology of the entire brewing process, from the raw ingredients (barley, malt, hops, water, yeast) to the production of beer and its quality assurance.  4 lectures.\n',
            addl: 'Term Typically Offered: TBD\nPrerequisite: CHEM 313 or CHEM 314 and MCRO 221.\n',
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
            id: 'CM280',
            catalog: '2022-2026',
            displayName: 'Building Information Modeling',
            units: '2',
            desc: 'Use of building information modeling software to emphasize residential, commercial, and heavy civil assembly methods and techniques.  BIM drafting applications integrated with construction materials, details, and assemblies supporting the understanding of the construction building process.  Course may be offered in classroom-based, online, or hybrid format.  2 activities.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: CE 113 or CM 115.\n',
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
            id: 'ME435',
            catalog: '2022-2026',
            displayName: 'Drilling Engineering',
            units: '4',
            desc: 'Theory and practice of oilwell planning, drilling, well logging, and completion applied to the development of new oil and gas production, from onshore and offshore fields.  4 lectures.\n',
            addl: 'Term Typically Offered: TBD\nPrerequisite: ME 329, ME 347.\n',
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
            id: 'PLSC445',
            catalog: '2022-2026',
            displayName: 'Cropping Systems',
            units: '4',
            desc: 'Classification and description of agricultural systems of the world.  Cropping systems as land management plans.  Systems approaches to improvement of agricultural situations.  Consideration of human factors and the agroecosystem in efforts to create a more sustainable agriculture.  Field trip required.  3 lectures, 1 activity.  Formerly AEPS 445.\n',
            addl: 'Term Typically Offered: W\nPrerequisite: PLSC 120; or BOT 121 and SS 120 or SS 121; or graduate standing.\n',
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
            id: 'CRP442',
            catalog: '2022-2026',
            displayName: 'Housing and Planning',
            units: '4',
            desc: 'Understanding housing issues, policies and programs from a planning perspective.  Analysis of the economic underpinnings of land markets and housing markets, housing plans, finance, public programs, affordable housing.  Course may be offered in classroom-based or online format.  4 seminars.\n',
            addl: 'Term Typically Offered: F\nSustainability Related\nPrerequisite: Junior standing.\n',
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
            id: 'BIO415',
            catalog: '2022-2026',
            displayName: 'Biogeography',
            units: '4',
            desc: 'Plant and animal distribution patterns in terrestrial and aquatic systems in relation to past and present physical and biotic factors.  Methods to determine local and global distribution patterns of biota.  Role of humans in past, present and future distributions of organisms.  4 lectures.\n',
            addl: 'Term Typically Offered: W\nPrerequisite: BIO 263 or graduate standing in Biological Sciences.\n',
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
            id: 'EDUC560',
            catalog: '2022-2026',
            displayName: 'Counseling Theories',
            units: '4',
            desc: 'Theories and practice of counseling with special emphasis on the counseling process.  Emphasis of conditions of counseling, counseling techniques, counseling diverse populations and the counselor as a professional helper.  3 seminars, 1 activity.\n',
            addl: 'Term Typically Offered: W\nPrerequisite: Admission to MS in Higher Education, Counseling and Student Affairs.\n',
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
            id: 'PHIL241',
            catalog: '2022-2026',
            displayName: 'Symbolic Logic',
            units: '4',
            desc: 'The nature of deductive logical systems.  Methods of notation, translation and proof in sentential and predicate calculi including truth-trees and natural deduction systems.  Introduction to meta-theory.  4 lectures.\n',
            addl: 'Term Typically Offered: F, SP\nPrerequisite: Completion of GE Area A3 with a grade of C- or better.\n',
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
            id: 'ME458',
            catalog: '2022-2026',
            displayName: 'Building Heating and Cooling Loads',
            units: '4',
            desc: 'Building heating and cooling load calculations, estimating energy consumption and operating costs for heating, ventilating and air-conditioning system design and selection.  3 lectures, 1 laboratory.\n',
            addl: 'Term Typically Offered: F\nPrerequisite: ME 303; and ME 343 or ME 350.\n',
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
            id: 'BUS425',
            catalog: '2022-2026',
            displayName: 'Auditing',
            units: '4',
            desc: 'Survey of the auditing environment including institutional, ethical, and legal liability dimensions.  Introduction to audit planning, assessing materiality and audit risk, collecting and evaluating audit evidence, considering the internal control structure, substantive testing, and reporting.  Course may be offered in classroom-based, online, or hybrid format.  4 lectures.\n',
            addl: 'Term Typically Offered: F, W, SP\nPrerequisite: BUS 322.\n',
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
            id: 'PEM191',
            catalog: '2022-2026',
            displayName: 'Swimming',
            units: '2',
            desc: 'Enrollment limited to those academically qualified to compete in intercollegiate athletic programs. Consent of coach required. Total credit limited to 8 units. Courses are each 2 units and meet for a minimum of 10 hours per week. All competitive athletics courses are evaluated on a Credit/No Credit basis.\n',
            addl: 'Term Typically Offered: TBD\nCR/NC\n',
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
            id: 'PEW191',
            catalog: '2022-2026',
            displayName: 'Swimming',
            units: '2',
            desc: 'Enrollment limited to those academically qualified to compete in intercollegiate athletic programs. Consent of coach required. Total credit limited to 8 units. Courses are each 2 units and meet for a minimum of 10 hours per week. All competitive athletics courses are evaluated on a Credit/No Credit basis.\n',
            addl: 'Term Typically Offered: TBD\nCR/NC\n',
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
            id: 'PSY458',
            catalog: '2022-2026',
            displayName: 'Learning',
            units: '4',
            desc: 'Theoretical and philosophical foundations of the experimental analysis of behavior.  Principles of classical and operant conditioning including aversive control of behavior through punishment and avoidance learning and the theoretical basis for behavior therapy techniques and applications of learning principles in education and health settings.  4 lectures.\n',
            addl: 'Term Typically Offered: TBD\nPrerequisite: PSY 333.\n',
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
            id: 'ENGL503',
            catalog: '2022-2026',
            displayName: 'Graduate Introduction to Linguistics',
            units: '4',
            desc: 'Introduction to linguistics for graduate students.  Phonology, morphology lexicon, syntax, and variation within language; application of linguistics to real-world issues.  4 seminars.\n',
            addl: 'Term Typically Offered: TBD\nPrerequisite: Graduate standing in English.\n',
            gwrCourse: false,
            uscpCourse: false,
            dynamicTerms: {
              termSummer: false,
              termFall: false,
              termWinter: false,
              termSpring: false
            }
          }
        ],
        searchLimitExceeded: true
      }
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('valid catalog search request succeeds (random term, search limit not exceeded)', async ({
    request
  }) => {
    // perform login
    await performLoginBackend(request, SEARCH_CATALOG_API_TESTS_EMAIL, 'test');

    const res = await request.post('/api/data/searchCatalog', {
      data: {
        catalog: '2022-2026',
        query: 'slkedmvklsdamklvasdmklvermvlkqnfvhjenvuiofdsncviujwcnrejkvnjk'
      }
    });

    const expectedResponseBody = {
      message: 'Catalog search request successful.',
      results: {
        searchResults: [],
        searchLimitExceeded: false
      }
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
});
