// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser() {
  return request<API.Response<API.CurrentUser>>('/api/log/current', {
    method: 'GET',
    errorModal: false,
  });
}

export async function has(username: string) {
  return request<API.Response<string>>('/api/log/has', {
    method: 'POST',
    errorModal: false,
    data: { username },
  });
}

export async function has_email(email: string) {
  return request<API.Response<string>>('/api/log/has_email', {
    method: 'GET',
    errorModal: false,
    params: { email },
  });
}
refine;
export async function current() {
  return request<API.Response<string>>('/api/log/current', { errorModal: false, method: 'GET' });
}

export async function refine(username: string, firstname: string, lastname: string) {
  return request<API.Response<string>>('/api/log/refine', {
    method: 'POST',
    skipErrorHandler: true,
    data: { username, firstname, lastname },
  });
}

export async function outLogin() {
  return request<Record<string, any>>('/api/log/outlogin', {
    method: 'GET',
    skipErrorHandler: true,
  });
}
export async function getUser(id: number) {
  return request<API.Response<API.CurrentUser>>('/api/log/getinfo', {
    method: 'GET',
    skipErrorHandler: true,
    params: {
      id,
    },
  });
}
