import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { populateFlowcharts } from '$test/util/userDataTestUtil';
import { createUser, deleteUser } from '$lib/server/db/user';
import { getUserEmailString, performLoginBackend } from '$test/util/userTestUtil';
import {
  UserDataUpdateChunkType,
  UserDataUpdateChunkTERM_MODCourseDataFrom
} from '$lib/types/mutateUserDataTypes';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types/apiDataTypes';

// see API route for expected return type
interface GetUserFlowchartsExpectedReturnType {
  message: string;
  flowcharts: Flowchart[];
  courseCache: CourseCache[] | undefined;
}

test.describe('FLOW_TERM_MOD payload tests for updateUserFlowcharts API', () => {
  const prisma = new PrismaClient();
  let userId: string;
  let userEmail: string;

  // eslint-disable-next-line no-empty-pattern
  test.beforeAll(async ({}, testInfo) => {
    // create account
    userEmail = getUserEmailString(
      'pfb_test_updateUserFlowchartsAPI_FLOW_TERM_MOD_playwright@test.com',
      testInfo
    );
    const id = await createUser({
      email: userEmail,
      username: 'test',
      password: 'test'
    });

    if (!id) {
      throw new Error('userId is null');
    }

    userId = id;
  });

  test.afterAll(async () => {
    // delete account
    await deleteUser(userEmail);
  });

  test('improperly formatted flow term mod chunk returns 400 (#1)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    // missing data field
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Data field for update chunk required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
  test('improperly formatted flow term mod chunk returns 400 (#2)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    // missing id field
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              // bogus data to pass validation
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: 0,
                    cIndex: 0
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['ID field for FLOW_TERM_MOD update chunk required.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
  test('improperly formatted flow term mod chunk returns 400 (#3)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    // id is not a uuid
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              id: 'lkvsdmvklsmdvklsdmlksd',
              // bogus data to pass validation
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: 0,
                    cIndex: 0
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['ID field for FLOW_TERM_MOD update chunk must be a UUID.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('improperly formatted flow term mod chunk returns 400 (#4)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    // termdata missing
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              // bogus data to pass validation
              id: 'b21255e4-5476-4f36-a093-94407698b400',
              tIndex: 0
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Term data field required for FLOW_TERM_MOD update chunk.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
  test('improperly formatted flow term mod chunk returns 400 (#5)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    // term data from type invalid
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              // bogus data to pass validation
              id: 'b21255e4-5476-4f36-a093-94407698b400',
              tIndex: 0,
              termData: [
                {
                  from: 'whatever'
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Invalid valid for from field in FLOW_TERM_MOD update chunk termData entry.']
      }
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });
  test('improperly formatted flow term mod chunk returns 400 (#6)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    // term data from=EXISTING data invalid
    const res1 = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              // bogus data to pass validation
              id: 'b21255e4-5476-4f36-a093-94407698b400',
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {}
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody1 = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Term index is required.', 'Course index is required.']
      }
    };

    const res2 = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              // bogus data to pass validation
              id: 'b21255e4-5476-4f36-a093-94407698b400',
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: -2,
                    cIndex: 4.8594849589
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody2 = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Flowchart term index too small.', 'Course index must be an integer.']
      }
    };

    const res3 = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              // bogus data to pass validation
              id: 'b21255e4-5476-4f36-a093-94407698b400',
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: 3,
                    cIndex: -5
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody3 = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Course index must not be negative.']
      }
    };

    expect(res1.status()).toBe(400);
    expect(await res1.json()).toStrictEqual(expectedResponseBody1);

    expect(res2.status()).toBe(400);
    expect(await res2.json()).toStrictEqual(expectedResponseBody2);

    expect(res3.status()).toBe(400);
    expect(await res3.json()).toStrictEqual(expectedResponseBody3);
  });
  test('improperly formatted flow term mod chunk returns 400 (#7)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    // term data from=NEW data invalid
    // just add a couple cases of invalid course data
    const res1 = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              // bogus data to pass validation
              id: 'b21255e4-5476-4f36-a093-94407698b400',
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.NEW,
                  data: {}
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody1 = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Course ID field is required.', 'Course card color is required.']
      }
    };

    const res2 = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              // bogus data to pass validation
              id: 'b21255e4-5476-4f36-a093-94407698b400',
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.NEW,
                  data: {
                    id: 'sldkvmklsdvlsd',
                    color: 'whatever'
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody2 = {
      message: 'Invalid input received.',
      validationErrors: {
        updateChunks: ['Course card color invalid, received whatever.']
      }
    };

    expect(res1.status()).toBe(400);
    expect(await res1.json()).toStrictEqual(expectedResponseBody1);

    expect(res2.status()).toBe(400);
    expect(await res2.json()).toStrictEqual(expectedResponseBody2);
  });
  test('improperly formatted flow term mod chunk returns 400 (#8)', async ({ request }) => {
    await performLoginBackend(request, userEmail, 'test');

    // flowchart id not found in user flow list
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              id: 'b21255e4-5476-4f36-a093-94407698b400',
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: 0,
                    cIndex: 0
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Requested user flowchart updates are not valid for these data.'
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('improperly formatted flow term mod chunk returns 400 (#9)', async ({ request }) => {
    // create a flow to test with
    await prisma.dBFlowchart.deleteMany({
      where: {
        ownerId: userId
      }
    });
    const flowId = (
      await populateFlowcharts(prisma, userId, 1, [
        {
          idx: 0,
          info: {
            termCount: 4,
            longTermCount: 2
          }
        }
      ])
    )[0];

    await performLoginBackend(request, userEmail, 'test');

    // existing indexes are invalid
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              id: flowId,
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: 50,
                    cIndex: 25
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Requested user flowchart updates are not valid for these data.'
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('improperly formatted flow term mod chunk returns 400 (#10)', async ({ request }) => {
    // create a flow to test with
    await prisma.dBFlowchart.deleteMany({
      where: {
        ownerId: userId
      }
    });
    const flowId = (
      await populateFlowcharts(prisma, userId, 1, [
        {
          idx: 0,
          info: {
            termCount: 4,
            longTermCount: 2
          }
        }
      ])
    )[0];

    await performLoginBackend(request, userEmail, 'test');

    // invalid programIdIndex
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              id: flowId,
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.NEW,
                  data: {
                    id: 'CPE100',
                    color: '#FFFFFF',
                    programIdIndex: 25
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'Requested user flowchart updates are not valid for these data.'
    };

    expect(res.status()).toBe(400);
    expect(await res.json()).toStrictEqual(expectedResponseBody);
  });

  test('valid term mod chunk returns 200 (rearrange in single term)', async ({ request }) => {
    // create a flow to test with
    await prisma.dBFlowchart.deleteMany({
      where: {
        ownerId: userId
      }
    });
    const flowId = (
      await populateFlowcharts(prisma, userId, 1, [
        {
          idx: 0,
          info: {
            termCount: 4,
            longTermCount: 2
          }
        }
      ])
    )[0];

    await performLoginBackend(request, userEmail, 'test');

    // do the request
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              id: flowId,
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: 0,
                    cIndex: 1
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'User flowchart data changes successfully persisted.'
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);

    // now verify that the request was persisted
    const initFlowRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(initFlowRes.status()).toBe(200);
    const initFlowsResJSON = (await initFlowRes.json()) as GetUserFlowchartsExpectedReturnType;
    const initFlowcharts: Flowchart[] = initFlowsResJSON.flowcharts;
    expect(initFlowsResJSON.message).toEqual('User flowchart retrieval successful.');
    expect(initFlowcharts.length).toBe(1);

    // check term content correct
    expect(initFlowcharts[0].id).toBe(flowId);
    const term = initFlowcharts[0].termData.find((term) => term.tIndex === 0);
    expect(term).toBeTruthy();
    expect(term?.courses).toHaveLength(1);
    expect(term?.courses[0]).toStrictEqual({
      id: 'MATH142',
      color: '#FEFD9A'
    });
  });

  test('valid term mod chunk returns 200 (rearrange from multiple terms)', async ({ request }) => {
    // create a flow to test with
    await prisma.dBFlowchart.deleteMany({
      where: {
        ownerId: userId
      }
    });
    const flowId = (
      await populateFlowcharts(prisma, userId, 1, [
        {
          idx: 0,
          info: {
            termCount: 4,
            longTermCount: 2
          }
        }
      ])
    )[0];

    await performLoginBackend(request, userEmail, 'test');

    // do the request
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              id: flowId,
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: 3,
                    cIndex: 2
                  }
                },
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: 4,
                    cIndex: 1
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'User flowchart data changes successfully persisted.'
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);

    // now verify that the request was persisted
    const initFlowRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(initFlowRes.status()).toBe(200);
    const initFlowsResJSON = (await initFlowRes.json()) as GetUserFlowchartsExpectedReturnType;
    const initFlowcharts: Flowchart[] = initFlowsResJSON.flowcharts;
    expect(initFlowsResJSON.message).toEqual('User flowchart retrieval successful.');
    expect(initFlowcharts.length).toBe(1);

    // check term content correct
    expect(initFlowcharts[0].id).toBe(flowId);
    const term = initFlowcharts[0].termData.find((term) => term.tIndex === 0);
    expect(term).toBeTruthy();
    expect(term?.courses).toHaveLength(2);
    expect(term?.courses[0]).toStrictEqual({
      id: 'MATH153',
      color: '#FCD09E'
    });
    expect(term?.courses[1]).toStrictEqual({
      id: null,
      customId:
        '1--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
      color: '#BFBFBF',
      customDisplayName:
        'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice ',
      customUnits: '5'
    });
  });

  test('valid term mod chunk returns 200 (new course)', async ({ request }) => {
    // create a flow to test with
    await prisma.dBFlowchart.deleteMany({
      where: {
        ownerId: userId
      }
    });
    const flowId = (
      await populateFlowcharts(prisma, userId, 1, [
        {
          idx: 0,
          info: {
            termCount: 2,
            longTermCount: 0
          }
        }
      ])
    )[0];

    await performLoginBackend(request, userEmail, 'test');

    // do the request
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              id: flowId,
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.NEW,
                  data: {
                    id: 'CPE100',
                    color: '#FFFFFF'
                  }
                },
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.NEW,
                  data: {
                    id: 'MATE210',
                    color: '#AAAAAA'
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'User flowchart data changes successfully persisted.'
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);

    // now verify that the request was persisted
    const initFlowRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(initFlowRes.status()).toBe(200);
    const initFlowsResJSON = (await initFlowRes.json()) as GetUserFlowchartsExpectedReturnType;
    const initFlowcharts: Flowchart[] = initFlowsResJSON.flowcharts;
    expect(initFlowsResJSON.message).toEqual('User flowchart retrieval successful.');
    expect(initFlowcharts.length).toBe(1);

    // check term content correct
    expect(initFlowcharts[0].id).toBe(flowId);
    const term = initFlowcharts[0].termData.find((term) => term.tIndex === 0);
    expect(term).toBeTruthy();
    expect(term?.courses).toHaveLength(2);
    expect(term?.courses[0]).toStrictEqual({
      id: 'CPE100',
      color: '#FFFFFF'
    });
    expect(term?.courses[1]).toStrictEqual({
      id: 'MATE210',
      color: '#AAAAAA'
    });
  });

  test('valid term mod chunk returns 200 (rearrange + new course)', async ({ request }) => {
    // create a flow to test with
    await prisma.dBFlowchart.deleteMany({
      where: {
        ownerId: userId
      }
    });
    const flowId = (
      await populateFlowcharts(prisma, userId, 1, [
        {
          idx: 0,
          info: {
            termCount: 4,
            longTermCount: 2
          }
        }
      ])
    )[0];

    await performLoginBackend(request, userEmail, 'test');

    // do the request
    const res = await request.post('/api/user/data/updateUserFlowcharts', {
      data: {
        updateChunks: [
          {
            type: UserDataUpdateChunkType.FLOW_TERM_MOD,
            data: {
              id: flowId,
              tIndex: 0,
              termData: [
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: 3,
                    cIndex: 2
                  }
                },
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.EXISTING,
                  data: {
                    tIndex: 4,
                    cIndex: 1
                  }
                },
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.NEW,
                  data: {
                    id: 'CPE100',
                    color: '#FFFFFF'
                  }
                },
                {
                  from: UserDataUpdateChunkTERM_MODCourseDataFrom.NEW,
                  data: {
                    id: 'MATE210',
                    color: '#AAAAAA'
                  }
                }
              ]
            }
          }
        ]
      }
    });

    const expectedResponseBody = {
      message: 'User flowchart data changes successfully persisted.'
    };

    expect(res.status()).toBe(200);
    expect(await res.json()).toStrictEqual(expectedResponseBody);

    // now verify that the request was persisted
    const initFlowRes = await request.get('/api/user/data/getUserFlowcharts');
    expect(initFlowRes.status()).toBe(200);
    const initFlowsResJSON = (await initFlowRes.json()) as GetUserFlowchartsExpectedReturnType;
    const initFlowcharts: Flowchart[] = initFlowsResJSON.flowcharts;
    expect(initFlowsResJSON.message).toEqual('User flowchart retrieval successful.');
    expect(initFlowcharts.length).toBe(1);

    // check term content correct
    expect(initFlowcharts[0].id).toBe(flowId);
    const term = initFlowcharts[0].termData.find((term) => term.tIndex === 0);
    expect(term).toBeTruthy();
    expect(term?.courses).toHaveLength(4);
    expect(term?.courses[0]).toStrictEqual({
      id: 'MATH153',
      color: '#FCD09E'
    });
    expect(term?.courses[1]).toStrictEqual({
      id: null,
      customId:
        '1--- is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longestthis is the longe',
      color: '#BFBFBF',
      customDisplayName:
        'nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice nice ',
      customUnits: '5'
    });
    expect(term?.courses[2]).toStrictEqual({
      id: 'CPE100',
      color: '#FFFFFF'
    });
    expect(term?.courses[3]).toStrictEqual({
      id: 'MATE210',
      color: '#AAAAAA'
    });
  });
});
