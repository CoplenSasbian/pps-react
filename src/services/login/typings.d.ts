// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    username?: string;
    firstname?: string;
    lastname?: string;
    lastname?: string;
    fullname?: string;
    email?: string;
    last_login?: number;
    join_date?: number;
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
