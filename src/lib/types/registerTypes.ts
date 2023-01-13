export type UserRegistrationData = {
  username: string;
  email: string;
  password: string;
};

export type UserRegistrationDataFull = UserRegistrationData & {
  passwordConfirm: string;
};
