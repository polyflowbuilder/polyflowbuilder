import { json } from '@sveltejs/kit';
import { initLogger } from '$lib/common/config/loggerConfig';
import { generateFlowchart } from '$lib/server/util/flowDataUtil';
import { validateStartYear } from '$lib/server/db/startYear';
import { getProgramsFromIds } from '$lib/server/db/program';
import { generateFlowchartSchema } from '$lib/server/schema/generateFlowchartSchema';
import type { ProgramCache } from '$lib/types';
import type { RequestHandler } from '@sveltejs/kit';

const logger = initLogger('APIRouteHandler (/api/util/generateFlowchart)');

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
      const startYearValid = await validateStartYear(parseResults.data.startYear);
      const programCache: ProgramCache = new Map(
        (await getProgramsFromIds(parseResults.data.programIds)).map((prog) => [prog.id, prog])
      );

      // validate start year
      if (!startYearValid) {
        return json(
          {
            message: 'Invalid input received.',
            validationErrors: {
              startYear: [`Invalid start year ${parseResults.data.startYear}.`]
            }
          },
          {
            status: 400
          }
        );
      }

      // validate programIds
      const invalidProgramIds = parseResults.data.programIds.filter((id) => !programCache.has(id));
      if (invalidProgramIds.length) {
        return json(
          {
            message: 'Invalid input received.',
            validationErrors: {
              programIds: [`Invalid program id(s) ${invalidProgramIds.toString()}.`]
            }
          },
          {
            status: 400
          }
        );
      }

      const { flowchart: generatedFlowchart, courseCache } = await generateFlowchart(
        parseResults.data,
        programCache
      );

      return json({
        message: 'Flowchart successfully generated.',
        generatedFlowchart,
        ...(parseResults.data.generateCourseCache && {
          // serialize course cache
          courseCache: Array.from(courseCache.values())
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
