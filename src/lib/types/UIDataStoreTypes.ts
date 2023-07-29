interface FlowListUIDataDisplayInfo {
  catalog: string;
  majorName: string;
  concName: string | null;
}

export interface FlowListUIData {
  id: string;
  name: string;
  startYear: string;
  displayInfo: FlowListUIDataDisplayInfo[];
  notes: string;
  published: boolean;
  imported: boolean;
}

export interface SelectedCourse {
  selected: boolean;
  tIndex: number;
  cIndex: number;
}
