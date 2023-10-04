import { expect, test } from '@playwright/test';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginBackend } from 'tests/util/userTestUtil';

test.describe('queryAvailableProgramsTests tests', () => {
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_queryAvailableProgramsAPI_playwright@test.com',
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

  test('program query with no parameters has correct response', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get('/api/data/queryAvailablePrograms');

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        query: ['Invalid query for available programs.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('program query with invalid combination of parameters has correct response', async ({
    request
  }) => {
    await performLoginBackend(request, userEmail, 'test');

    // id+major
    const res1 = await request.get(
      '/api/data/queryAvailablePrograms?id=c888a952-751b-4879-afa7-45dd17ba5804&majorName=test'
    );

    // id+major+catalog
    const res2 = await request.get(
      '/api/data/queryAvailablePrograms?id=c888a952-751b-4879-afa7-45dd17ba5804&majorName=test&catalog=2015-2017'
    );

    // id+catalog
    const res3 = await request.get(
      '/api/data/queryAvailablePrograms?id=c888a952-751b-4879-afa7-45dd17ba5804&catalog=2015-2017'
    );

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        query: ['Invalid query for available programs.']
      }
    };

    expect(res1.status()).toBe(400);
    expect(res2.status()).toBe(400);
    expect(res3.status()).toBe(400);
    expect(await res1.json()).toStrictEqual(expectedResponseBody);
    expect(await res2.json()).toStrictEqual(expectedResponseBody);
    expect(await res3.json()).toStrictEqual(expectedResponseBody);
  });

  test('program query with invalid id format handled correctly', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get('/api/data/queryAvailablePrograms?id=thisisnotauuid');

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        query: ['Invalid format for program unique ID.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('program query with invalid majorName format handled correctly', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get('/api/data/queryAvailablePrograms?catalog=2015-2017&majorName=');

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        query: ['Major name must not be empty.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('program query with invalid catalog format handled correctly', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res1 = await request.get('/api/data/queryAvailablePrograms?majorName=test&catalog=test');
    const res2 = await request.get('/api/data/queryAvailablePrograms?majorName=test&catalog=15-17');
    const res3 = await request.get(
      '/api/data/queryAvailablePrograms?majorName=test&catalog=2015-test'
    );
    const res4 = await request.get(
      '/api/data/queryAvailablePrograms?majorName=test&catalog=2017-2015'
    );

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

  test('successful program query with id, id exists', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(
      '/api/data/queryAvailablePrograms?id=0017f92d-d73f-4819-9d59-8c658cd29be5'
    );

    const expectedResponseBody = {
      message: 'Available programs query successful.',
      results: [
        {
          id: '0017f92d-d73f-4819-9d59-8c658cd29be5',
          catalog: '2017-2019',
          majorName: 'General Engineering',
          concName: 'ICS: Product Design Emphasis*',
          code: '17-19.52GENEBSU.EMPH-ProductDesign',
          dataLink:
            'http://flowcharts.calpoly.edu/downloads/mymap/17-19.52GENEBSU.EMPH-ProductDesign.pdf'
        }
      ]
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('successful program query with id, id does not exist', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(
      '/api/data/queryAvailablePrograms?id=c888a952-751b-4879-afa7-45dd17ba5804'
    );

    const expectedResponseBody = {
      message: 'Available programs query successful.',
      results: []
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('successful program query with catalog+majorName, returns results', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(
      '/api/data/queryAvailablePrograms?catalog=2015-2017&majorName=Computer Science'
    );

    const expectedResponseBody = {
      message: 'Available programs query successful.',
      results: [
        {
          catalog: '2015-2017',
          code: '15-17.52CSCBSU.IENTCSCU',
          concName: 'Interactive Entertainment',
          dataLink: 'http://flowcharts.calpoly.edu/downloads/mymap/15-17.52CSCBSU.IENTCSCU.pdf',
          id: '686a70e5-15b6-429e-8e7c-8d83ab5e5809',
          majorName: 'Computer Science'
        },
        {
          catalog: '2015-2017',
          code: '15-17.52CSCBSU',
          concName: 'Non-Concentration Option',
          dataLink: 'http://flowcharts.calpoly.edu/downloads/mymap/15-17.52CSCBSU.pdf',
          id: '3acb81e1-2b71-4aa7-bd89-b380fd356a70',
          majorName: 'Computer Science'
        }
      ]
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('successful program query with catalog+majorName, does not return results', async ({
    request
  }) => {
    await performLoginBackend(request, userEmail, 'test');

    const res = await request.get(
      '/api/data/queryAvailablePrograms?catalog=2015-2017&majorName=nice'
    );

    const expectedResponseBody = {
      message: 'Available programs query successful.',
      results: []
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('401 case handled properly', async ({ request }) => {
    const res = await request.get('/api/data/queryAvailablePrograms?id=test');
    const resData = (await res.json()) as unknown;

    expect(res.ok()).toBeFalsy();
    expect(res.status()).toBe(401);
    expect(resData).toStrictEqual({
      message: 'Available programs query request must be authenticated.'
    });
  });

  // TODO: add 500 case
});
