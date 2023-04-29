import type { PageLoad } from './$types';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
  // get flowcharts with course cache
  // if we include multiple requests, make sure they are using the promise streaming SK flow
  const userFlowcharts = await fetch('/api/user/data/getUserFlowcharts?includeCourseCache=true');
  if (!userFlowcharts.ok) {
    return null;
  } else {
    const userFlowchartsJson = (await userFlowcharts.json()) as {
      message: string;
      flowcharts: Flowchart[];
      courseCache: CourseCache[];
    };

    return {
      flowcharts: userFlowchartsJson.flowcharts,
      courseCache: userFlowchartsJson.courseCache
    };
  }
};
