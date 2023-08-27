import { getCatalogs } from '$lib/server/db/catalog';
import { getStartYears } from '$lib/server/db/startYear';
import { redirectIfAnonymous } from '$lib/server/util/authUtil';
import type { Program } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { CourseCache } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
  redirectIfAnonymous(event);

  async function fetchUserData(): Promise<{
    flowcharts: Flowchart[];
    courseCache: CourseCache[];
    programMetadata: Program[];
  }> {
    const data = await event.fetch(
      '/api/user/data/getUserFlowcharts?includeCourseCache=true&includeProgramMetadata=true'
    );

    const dataJson = (await data.json()) as {
      flowcharts: Flowchart[];
      courseCache: CourseCache[];
      programMetadata: Program[];
      message: string;
    };

    return {
      flowcharts: dataJson.flowcharts,
      courseCache: dataJson.courseCache,
      programMetadata: dataJson.programMetadata
    };
  }

  return {
    userData: fetchUserData(),
    flowchartStartYears: getStartYears(),
    flowchartCatalogs: getCatalogs()
  };
};
