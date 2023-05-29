// types for mutating user data

import type { Flowchart } from '$lib/common/schema/flowchartSchema';

export enum UserDataUpdateChunkType {
  FLOW_LIST_CHANGE,
  FLOW_UPSERT_ALL,
  FLOW_DELETE,
  FLOW_TERM_MOD,
  FLOW_TERMS_ADD
}

export enum UserDataUpdateChunkTERM_MODCourseDataFrom {
  NEW,
  EXISTING
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
