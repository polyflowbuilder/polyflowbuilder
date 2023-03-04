import type { PageLoad } from './$types';
import type { Flowchart } from '$lib/common/schema/flowchartSchema';

export const load: PageLoad = async ({ fetch }) => {
  // get flowcharts
  async function getUserFlowcharts(): Promise<Flowchart[] | null> {
    const userFlowcharts = await fetch('/api/user/data/getUserFlowcharts');
    if (!userFlowcharts.ok) {
      return null;
    } else {
      return (await userFlowcharts.json()).flowcharts as Flowchart[];
    }
  }

  return {
    flowcharts: getUserFlowcharts()
  };
};
