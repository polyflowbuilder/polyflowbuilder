import type { ValidationDataFull } from './flowchartValidationTypes';

type UserCourse = {
  cID: string | null;
  cardColor: string;

  cCustomID?: string;
  cCustomDisplayName?: string;
  cCustomUnits?: string;
  cCustomNote?: string;
  cProgramIDIndex?: number; // for multiple program support
};

type UserTerm = {
  tIndex: number;
  tUnits: string; // b/c we can have ranged units
  classes: UserCourse[];
};

type UserValidationData = ValidationDataFull & {
  timestamp: string;
};

type Flowchart = {
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

type UserData = {
  flows: Flowchart[];
  notifs: string[];
};

// user data object representation on frontend
type User = {
  username: string;
  email: string;
  data: UserData;
};
