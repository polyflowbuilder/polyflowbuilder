import type { ValidationDataFull } from './flowchartValidationTypes';

interface UserCourse {
  cID: string | null;
  cardColor: string;

  cCustomID?: string;
  cCustomDisplayName?: string;
  cCustomUnits?: string;
  cCustomNote?: string;
  cProgramIDIndex?: number; // for multiple program support
}

interface UserTerm {
  tIndex: number;
  tUnits: string; // b/c we can have ranged units
  classes: UserCourse[];
}

type UserValidationData = ValidationDataFull & {
  timestamp: string;
};

interface Flowchart {
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
}

interface UserData {
  flows: Flowchart[];
  notifs: string[];
}

// user data object representation on frontend
export interface User {
  username: string;
  email: string;
  data: UserData;
}
