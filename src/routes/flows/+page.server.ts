import { getCatalogs } from '$lib/server/db/catalog';
import { getStartYears } from '$lib/server/db/startYear';
import { redirectIfAnonymous } from '$lib/server/util/authUtil';
import type { Program } from '@prisma/client';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';
import type { RequestEvent } from './$types';
import type { APICourseFull } from '$lib/types';

export async function load(event: RequestEvent) {
  redirectIfAnonymous(event);

  async function fetchUserData(): Promise<{
    flowcharts: Flowchart[];
    courseCache: APICourseFull[];
    programMetadata: Program[];
  }> {
    const data = await event.fetch(
      '/api/user/data/getUserFlowcharts?includeCourseCache=true&includeProgramMetadata=true'
    );

    const dataJson = (await data.json()) as {
      flowcharts: Flowchart[];
      courseCache: APICourseFull[];
      programMetadata: Program[];
      message: string;
    };

    return {
      flowcharts: dataJson.flowcharts,
      courseCache: dataJson.courseCache,
      programMetadata: dataJson.programMetadata
    };
  }

  const [userData, flowchartStartYears, flowchartCatalogs] = await Promise.all([
    fetchUserData(),
    getStartYears(),
    getCatalogs()
  ]);

  return {
    userData,
    flowchartStartYears,
    flowchartCatalogs
  };
}
