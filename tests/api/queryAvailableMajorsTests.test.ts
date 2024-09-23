import { expect, test } from '@playwright/test';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginBackend } from '$test/util/userTestUtil';

test.describe('queryAvailableMajors tests', () => {
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_queryAvailableMajorsAPI_playwright@test.com',
      testInfo
    );
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

  test('major query with no parameters handled properly', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get('/api/data/queryAvailableMajors');

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        query: ['Catalog is required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('major query with invalid catalog format handled properly', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res1 = await request.get('/api/data/queryAvailableMajors?catalog=test');
    const res2 = await request.get('/api/data/queryAvailableMajors?catalog=15-17');
    const res3 = await request.get('/api/data/queryAvailableMajors?catalog=2015-test');
    const res4 = await request.get('/api/data/queryAvailableMajors?catalog=2017-2015');

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        query: ['Invalid catalog format.']
      }
    };

    expect(res1.status()).toBe(400);
    expect(res2.status()).toBe(400);
    expect(res3.status()).toBe(400);
    expect(res4.status()).toBe(400);
    expect(await res1.json()).toStrictEqual(expectedResponseBody);
    expect(await res2.json()).toStrictEqual(expectedResponseBody);
    expect(await res3.json()).toStrictEqual(expectedResponseBody);
    expect(await res4.json()).toStrictEqual(expectedResponseBody);
  });

  test('successful major query with catalog, catalog exists', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get('/api/data/queryAvailableMajors?catalog=2015-2017');

    const expectedResponseBody = {
      message: 'Available majors query successful.',
      results: [
        'Aerospace Engineering',
        'Agricultural and Environmental Plant Sciences',
        'Agricultural Business',
        'Agricultural Communication',
        'Agricultural Science',
        'Agricultural Systems Management',
        'Animal Science',
        'Anthropology and Geography',
        'Architectural Engineering',
        'Architecture',
        'Art and Design',
        'Biochemistry',
        'Biological Sciences',
        'Biomedical Engineering',
        'BioResource and Agricultural Engineering',
        'Business Administration',
        'Chemistry',
        'Child Development',
        'City and Regional Planning',
        'Civil Engineering',
        'Communication Studies',
        'Comparative Ethnic Studies',
        'Computer Engineering',
        'Computer Science',
        'Construction Management',
        'Dairy Science',
        'Economics',
        'Electrical Engineering',
        'English',
        'Environmental Earth and Soil Sciences',
        'Environmental Engineering',
        'Environmental Management and Protection',
        'Food Science',
        'Forestry and Natural Resources',
        'General Engineering',
        'Graphic Communication',
        'History',
        'Industrial Engineering',
        'Industrial Technology and Packaging',
        'Journalism',
        'Kinesiology',
        'Landscape Architecture',
        'Liberal Arts and Engineering Studies',
        'Liberal Studies',
        'Manufacturing Engineering',
        'Marine Sciences',
        'Materials Engineering',
        'Mathematics',
        'Mechanical Engineering',
        'Microbiology',
        'Modern Languages and Literatures',
        'Music',
        'Nutrition',
        'Philosophy',
        'Physics - BA',
        'Physics - BS',
        'Political Science',
        'Psychology',
        'Recreation, Parks, and Tourism Administration',
        'Sociology',
        'Software Engineering',
        'Statistics',
        'Theatre Arts',
        'Wine and Viticulture'
      ]
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('successful major query with catalog, catalog does not exist', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get('/api/data/queryAvailableMajors?catalog=2013-2015');

    const expectedResponseBody = {
      message: 'Available majors query successful.',
      results: []
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('401 case handled properly', async ({ request }) => {
    const res = await request.get('/api/data/queryAvailableMajors?catalog=2015-2017');

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual({
      message: 'Available majors query request must be authenticated.'
    });
  });

  // TODO: add 500 case
});
