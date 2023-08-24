import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { getUserFlowcharts } from '$lib/server/db/flowchart';
import { generateUserCourseCache } from '$lib/server/util/courseCacheUtil';
import { getUserFlowchartsSchema } from '$lib/server/schema/getUserFlowchartsSchema';
import type { Program } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/user/data/getUserFlowcharts)');

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // ensure user is authenticated
    if (!locals.session) {
      return json(
        {
          message: 'Request was unauthenticated. Please authenticate and try again.'
        },
        {
          status: 401
        }
      );
    }

    // validation
    const data = Object.fromEntries(url.searchParams);
    const parseResults = getUserFlowchartsSchema.safeParse({
      // convert from string-encoded data
      includeCourseCache: data.includeCourseCache ? data.includeCourseCache === 'true' : undefined,
      includeProgramMetadata: data.includeProgramMetadata
        ? data.includeProgramMetadata === 'true'
        : undefined
    });
    if (parseResults.success) {
      // get user data
      const userFlowchartsData = await getUserFlowcharts(locals.session.id, [], true);
      const flowcharts: Flowchart[] = [];
      const programMetadata: Program[] = [];

      userFlowchartsData.forEach((data) => {
        flowcharts.push(data.flowchart);
        // to satisfy type checking
        if (data.programMetadata) {
          programMetadata.push(...data.programMetadata);
        }
      });

      return json({
        message: 'User flowchart retrieval successful.',
        flowcharts,
        ...(parseResults.data.includeCourseCache && {
          courseCache: await generateUserCourseCache(flowcharts, programMetadata)
        }),
        ...(parseResults.data.includeProgramMetadata && {
          programMetadata
        })
      });
    } else {
      const { fieldErrors: validationErrors } = parseResults.error.flatten();

      return json(
        {
          message: 'Invalid input received.',
          validationErrors
        },
        {
          status: 400
        }
      );
    }
  } catch (error) {
    logger.error('an internal error occurred', error);
    return json(
      {
        message: 'An error occurred while fetching user flowcharts, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
