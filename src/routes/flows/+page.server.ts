import { redirectIfAnonymous } from '$lib/server/util/authUtil';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  redirectIfAnonymous(event);

  // fetch user flowcharts
  const userFlowcharts = await event.fetch('/api/user/data/getUserFlowcharts');
  if (!userFlowcharts.ok) {
    return {
      flowcharts: null
    };
  } else {
    return {
      flowcharts: (await userFlowcharts.json()).flowcharts
    };
  }
};
