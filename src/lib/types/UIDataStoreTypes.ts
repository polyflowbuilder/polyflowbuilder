type FlowListUIDataDisplayInfo = {
  catalog: string;
  majorName: string;
  concName: string | null;
};

export type FlowListUIData = {
  id: string;
  name: string;
  startYear: string;
  displayInfo: FlowListUIDataDisplayInfo[];
  notes: string;
  published: boolean;
  imported: boolean;
};
