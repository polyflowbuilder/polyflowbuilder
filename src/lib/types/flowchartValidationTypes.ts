// types for everything validation related (excluding curriculum sheet validation)

import type { Flowchart } from '$lib/common/schema/flowchartSchema';

export enum CourseValidationStatus {
  UNABLE_TO_AUTO_VALIDATE,
  ALL_REQ_MET,
  ALL_REQ_MET_NO_RECOMM,
  REQ_MISSING
}

export enum CourseValidationType {
  PREREQUISITE,
  COREQUISITE,
  CONCURRENT_REQUISITE
}

export type FlowValidationData = {
  email: string;
  data: Flowchart;
};

export type ValidationCriteria = {
  notes: string;
  valid: boolean;
};

export type ValidationRequisiteData = {
  reqStr: string;
  successCode: CourseValidationStatus;
  override: boolean; // for user to override req
};

export type ValidationRequisiteCheckObject = {
  cID: string;
  coReq: ValidationRequisiteData[];
  conReq: ValidationRequisiteData[];
  pReq: ValidationRequisiteData[];
  recReq: ValidationRequisiteData[];
  status: CourseValidationStatus;
};

export type ValidationDataSummary = {
  UDMnChck: ValidationCriteria;
  USCPChck: ValidationCriteria;
  _GWRChck: ValidationCriteria;
  unitChck: ValidationCriteria;
};

export type ValidationDataFull = {
  hash: string;
  summaryData: ValidationDataSummary;
  reqsData: ValidationRequisiteCheckObject[];
};
