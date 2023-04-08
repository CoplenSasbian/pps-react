// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function login(username: string, password: string) {
  return request<API.Response<string>>('/api/log/login', {
    method: 'POST',
    errorModal: false,
    data: { username, password },
  });
}

export async function registered(username: string, password: string, email: string) {
  return request<API.Response<string>>('/api/log/registered', {
    method: 'POST',
    skipErrorHandler: true,
    data: { username, password, email },
  });
}

export async function logout() {
  return request<API.Response<string>>('/api/log/out', {
    method: 'GET',
    skipErrorHandler: true,
  });
}
