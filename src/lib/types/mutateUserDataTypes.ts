// types for mutating user data

import type { Flowchart } from '$lib/common/schema/flowchartSchema';

export type MutateFlowchartData = {
  flowchart: Flowchart;
  pos: number;
};
