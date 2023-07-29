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

export interface FlowValidationData {
  email: string;
  data: Flowchart;
}

export interface ValidationCriteria {
  notes: string;
  valid: boolean;
}

export interface ValidationRequisiteData {
  reqStr: string;
  successCode: CourseValidationStatus;
  override: boolean; // for user to override req
}

export interface ValidationRequisiteCheckObject {
  cID: string;
  coReq: ValidationRequisiteData[];
  conReq: ValidationRequisiteData[];
  pReq: ValidationRequisiteData[];
  recReq: ValidationRequisiteData[];
  status: CourseValidationStatus;
}

export interface ValidationDataSummary {
  UDMnChck: ValidationCriteria;
  USCPChck: ValidationCriteria;
  _GWRChck: ValidationCriteria;
  unitChck: ValidationCriteria;
}

export interface ValidationDataFull {
  hash: string;
  summaryData: ValidationDataSummary;
  reqsData: ValidationRequisiteCheckObject[];
}
