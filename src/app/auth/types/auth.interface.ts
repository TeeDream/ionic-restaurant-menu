export interface RegistrationInterface {
  email: string;
  password: string;
}

export interface UserInterface {
  id: number;
  email: string;

  [key: string]: string | number | boolean | undefined | object;
}

export interface RegistrationLoginResponse {
  accessToken: string;
  user: UserInterface & {
    admin?: boolean;
  };
}
