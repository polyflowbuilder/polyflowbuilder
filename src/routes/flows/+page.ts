import type { Program } from '@prisma/client';
import type { PageLoad } from './$types';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
  // get flowcharts with course cache
  // if we include multiple requests, make sure they are using the promise streaming SK flow
  const userFlowcharts = await fetch(
    '/api/user/data/getUserFlowcharts?includeCourseCache=true&includeProgramMetadata=true'
  );
  if (!userFlowcharts.ok) {
    // need this explicitly instead of null to ensure types are inferred correctly
    return undefined;
  } else {
    const userFlowchartsJson = (await userFlowcharts.json()) as {
      message: string;
      flowcharts: Flowchart[];
      courseCache: CourseCache[];
      programMetadata: Program[][];
    };

    return {
      flowcharts: userFlowchartsJson.flowcharts,
      courseCache: userFlowchartsJson.courseCache,
      programMetadata: userFlowchartsJson.programMetadata
    };
  }
};
