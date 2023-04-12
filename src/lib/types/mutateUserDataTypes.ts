// types for mutating user data

import type { Flowchart } from '$lib/common/schema/flowchartSchema';

export enum UserDataUpdateChunkType {
  FLOW_LIST_CHANGE,
  FLOW_UPSERT_ALL,
  FLOW_DELETE
}

export type MutateFlowchartData = {
  flowchart: Flowchart;
  pos: number;
};

type MutateUserDataUtilCommonResultSuccess = {
  success: true;
  flowchartsData: MutateFlowchartData[];
};
type MutateUserDataUtilCommonResultFailure = {
  success: false;
  errors: string[];
};
export type MutateUserDataUtilCommonResult =
  | MutateUserDataUtilCommonResultSuccess
  | MutateUserDataUtilCommonResultFailure;
