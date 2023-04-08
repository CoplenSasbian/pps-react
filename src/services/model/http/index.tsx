import { request } from 'umi';
import './typings';
export async function getModelList() {
  return request<API.DataBaseData<API.Model>[]>('/api/model/list', {
    method: 'GET',
    skipErrorHandler: true,
  });
}

export async function getDetail(id: number) {
  return request<API.DataBaseData<API.Model>[]>('/api/model/detail', {
    method: 'GET',
    skipErrorHandler: true,
    params: {
      id,
    },
  });
}
