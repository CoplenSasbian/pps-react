// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    username?: string;
    fullname?: string;
    email?: string;
    last_login?: Date;
    is_superuser?: boolean;
  };

  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type Response<T> = {
    state: boolean;
    message: T;
  };
}
