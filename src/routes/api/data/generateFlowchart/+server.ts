import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { getStartYears } from '$lib/server/db/startYear';
import { generateFlowchart } from '$lib/server/util/flowDataUtil';
import { getProgramsFromIds } from '$lib/server/db/program';
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
    const data = Object.fromEntries(url.searchParams) as Record<string, string | undefined>;
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
      // fetch start years and program data to do additional validation
      const startYears = await getStartYears();
      const programMetadata = await getProgramsFromIds(parseResults.data.programIds);
      const programIdsSet = new Set(parseResults.data.programIds);

      // validate start year
      if (!startYears.includes(parseResults.data.startYear)) {
        return json(
          {
            message: 'Invalid start year.'
          },
          {
            status: 400
          }
        );
      }

      // validate programIds
      const invalidProgramIds = programMetadata
        .map((prog) => prog.id)
        .filter((id) => !programIdsSet.has(id));
      if (invalidProgramIds.length) {
        return json(
          {
            message: `Invalid program IDs IDs ${invalidProgramIds.toString()}.`
          },
          {
            status: 400
          }
        );
      }

      const { flowchart: generatedFlowchart, rest } = await generateFlowchart(parseResults.data);

      return json({
        message: 'Flowchart successfully generated.',
        generatedFlowchart,
        ...(parseResults.data.generateCourseCache && {
          courseCache: await generateCourseCacheFlowchart(generatedFlowchart, programMetadata)
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
