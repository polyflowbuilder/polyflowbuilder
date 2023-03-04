import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/config/loggerConfig';
import { generateFlowchart } from '$lib/server/util/flowDataUtil';
import { generateFlowchartSchema } from '$lib/server/schema/generateFlowchartSchema';
import { generateCourseCacheFlowchart } from '$lib/server/util/courseCacheUtil';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/data/generateFlowchart)');

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    // ensure request is authenticated
    if (!locals.session) {
      return json(
        {
          message: 'Generate flowchart request must be authenticated.'
        },
        {
          status: 401
        }
      );
    }

    // validation
    const data = Object.fromEntries(url.searchParams);
    const parseResults = generateFlowchartSchema.safeParse({
      // convert from string-encoded data
      ...data,
      ownerId: locals.session.id,
      programIds: data.programIds?.split(','),
      removeGECourses: data.removeGECourses ? data.removeGECourses === 'true' : undefined,
      generateCourseCache: data.generateCourseCache
        ? data.generateCourseCache === 'true'
        : undefined
    });
    if (parseResults.success) {
      const generatedFlowchart = await generateFlowchart(parseResults.data);

      // TODO: persist newly generated flowchart to user model

      return json({
        message: 'Flowchart successfully generated.',
        generatedFlowchart,
        ...(parseResults.data.generateCourseCache && {
          courseCache: generateCourseCacheFlowchart(generatedFlowchart)
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
        message: 'An error occurred while generating new flowchart, please try again a bit later.'
      },
      {
        status: 500
      }
    );
  }
};
