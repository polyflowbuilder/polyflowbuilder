// TODO: remove and just use ComputedCourseItemDisplayData?
export type FlowchartPDFCourseData = {
  idName: string;
  displayName: string;
  color: string;
  units: string;
};

export type FlowchartPDFTermData = {
  tName: string;
  tUnits: string;
  tData: FlowchartPDFCourseData[];
};

export type FlowchartPDFData = {
  name: string;
  programStringFriendly: string;
  unitTotal: string;
  notes: string;
  data: FlowchartPDFTermData[];
};
