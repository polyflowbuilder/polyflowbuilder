import type { ValidationDataFull } from './flowchartValidationTypes';

export type UserCourse = {
  cID: string | null;
  cardColor: string;

  cCustomID?: string;
  cCustomDisplayName?: string;
  cCustomUnits?: string;
  cCustomNote?: string;
  cProgramIDIndex?: number; // for multiple program support
};

export type UserTerm = {
  tIndex: number;
  tUnits: string; // b/c we can have ranged units
  classes: UserCourse[];
};

export type UserValidationData = ValidationDataFull & {
  timestamp: string;
};

export type Flowchart = {
  flowName: string;
  flowId: string[]; // array of program IDs
  flowStartYear: string;
  flowUnitTotal: string; // b/c we can have ranged units
  flowNotes: string;
  data: UserTerm[];
  dataModelVersion: number;
  flowHash: string;
  validationData?: UserValidationData;
  publishedID: string | null;
  importedID: string | null;
};

export type UserData = {
  flows: Flowchart[];
  notifs: string[];
};

// user data object representation on frontend
export type User = {
  username: string;
  email: string;
  data: UserData;
};
