// enumerate possible user data update types
export enum UserDataUpdateChunkType {
  FLOW_LIST_CHANGE
}

// internal types for each of the possible update payloads
type UserDataUpdateChunk_FLOW_LIST_CHANGE = {
  type: UserDataUpdateChunkType.FLOW_LIST_CHANGE;
  data: {
    order: {
      id: string;
      pos: number;
    }[];
  };
};

// create a discriminated union for different update payload types
export type UserDataUpdateChunk = UserDataUpdateChunk_FLOW_LIST_CHANGE;
