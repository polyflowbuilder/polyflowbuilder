// TODO: remove and just use ComputedCourseItemDisplayData?
export interface FlowchartPDFCourseData {
  idName: string;
  displayName: string;
  color: string;
  units: string;
}

export interface FlowchartPDFTermData {
  tName: string;
  tUnits: string;
  tData: FlowchartPDFCourseData[];
}

export interface FlowchartPDFData {
  name: string;
  programStringFriendly: string;
  unitTotal: string;
  notes: string;
  data: FlowchartPDFTermData[];
}
