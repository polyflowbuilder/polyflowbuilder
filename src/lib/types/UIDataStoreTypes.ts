type FlowListUIDataDisplayInfo = {
  catalog: string;
  majorName: string;
  concName: string | null;
};

export type FlowListUIData = {
  name: string;
  startYear: string;
  displayInfo: FlowListUIDataDisplayInfo[];
  notes: string;
  published: boolean;
  imported: boolean;
};
