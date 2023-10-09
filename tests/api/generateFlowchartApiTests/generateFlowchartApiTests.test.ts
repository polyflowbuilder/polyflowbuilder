import crypto from 'crypto';
import { expect, test } from '@playwright/test';
import { FLOW_NAME_MAX_LENGTH } from '$lib/common/config/flowDataConfig';
import { createUser, deleteUser } from '$lib/server/db/user';
import { flowchartValidationSchema } from '$lib/common/schema/flowchartSchema';
import { getUserEmailString, performLoginBackend } from 'tests/util/userTestUtil';
import { cloneAndDeleteNestedProperty, deleteObjectProperties } from 'tests/util/testUtil';
import {
  responsePayload1,
  responsePayload2
} from 'tests/api/generateFlowchartApiTests/expectedResponsePayloads';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types/apiDataTypes';

// see API for expected return type
interface GenerateFlowchartExpectedReturnType {
  message: string;
  generatedFlowchart: Flowchart;
  courseCache: CourseCache[] | undefined;
}

test.describe('generate flowchart api input tests', () => {
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_generateFlowchartAPI_inputs_playwright@test.com',
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

  test('generate flowchart api returns 401 without authorization', async ({ request }) => {
    const res = await request.get('/api/data/generateFlowchart');

    const expectedResponseBody = {
      message: 'Generate flowchart request must be authenticated.'
    };

    expect(res.status()).toBe(401);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 without any data', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

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
    await performLoginBackend(request, userEmail, 'test');

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
    await performLoginBackend(request, userEmail, 'test');

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
    await performLoginBackend(request, userEmail, 'test');

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

  test('generate flowchart api returns 400 w invalid start year format', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

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

  test('generate flowchart api returns 400 w invalid start year', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const searchParams = new URLSearchParams({
      name: 'test',
      startYear: '2005',
      programIds: '68be11b7-389b-4ebc-9b95-8997e7314497'
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        startYear: ['Invalid start year 2005.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 w invalid program id (one program)', async ({
    request
  }) => {
    await performLoginBackend(request, userEmail, 'test');

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
    await performLoginBackend(request, userEmail, 'test');

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
    await performLoginBackend(request, userEmail, 'test');

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
    await performLoginBackend(request, userEmail, 'test');

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

  test('generate flowchart api returns 400 w nonexistent program id (one)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const searchParams = new URLSearchParams({
      name: 'test',
      startYear: '2020',
      programIds: '1e292a2d-bdad-43b3-a89e-5ff8fc9b93d3'
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        programIds: ['Invalid program id(s) 1e292a2d-bdad-43b3-a89e-5ff8fc9b93d3.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 400 w nonexistent program id (two)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    const searchParams = new URLSearchParams({
      name: 'test',
      startYear: '2020',
      programIds: '1e292a2d-bdad-43b3-a89e-5ff8fc9b93d3,0c1ea546-75ac-4753-9505-bcac01ef8505'
    });

    const res = await request.get(`/api/data/generateFlowchart?${searchParams.toString()}`);

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        programIds: [
          'Invalid program id(s) 1e292a2d-bdad-43b3-a89e-5ff8fc9b93d3,0c1ea546-75ac-4753-9505-bcac01ef8505.'
        ]
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('generate flowchart api returns 200 with valid options', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

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
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_generateFlowchartAPI_outputs_playwright@test.com',
      testInfo
    );
    const newUserId = await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });

    if (newUserId) {
      ownerId = newUserId;
    }
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(userEmail);
  });

  test('generate valid flowchart with 1 program', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

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
    await performLoginBackend(request, userEmail, 'test');

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
    await performLoginBackend(request, userEmail, 'test');

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
    await performLoginBackend(request, userEmail, 'test');

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
