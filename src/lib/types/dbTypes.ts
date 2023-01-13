// types for all data in the DB

import type { User } from './userDataTypes';

// TODO: use something else for create user
export enum DBResponses {
  SUCCESS,
  USER_EXISTS
}

export type DBUserModel = User & {
  id: string; // UUID
  emailValid: 0 | 1;
  password: string;
  createDate: Date | null;
  lastLoginDate: Date | null;
  // for User.data property, JSON is encoded as string in db, but decoded in db hook
};
