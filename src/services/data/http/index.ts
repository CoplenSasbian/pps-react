import { request } from 'umi';

async function getData(modelId: number, data: any) {
  return request<any>('/api/data/page', {
    method: 'POST',
    skipErrorHandler: true,
    data: {
      modelId,
      ...data,
    },
  });
}

async function addData(modelId: number, params: any) {
  return addDatas(modelId, [params]);
}

async function dataToJson(file: string, dataType: string) {
  return request<any[]>('/api/data/tojson', {
    method: 'POST',
    skipErrorHandler: true,
    data: {
      data: file,
      dataType,
    },
  });
}

async function addDatas(modelId: number, data: any[]) {
  return request<string>('/api/data/adddatas', {
    method: 'POST',
    skipErrorHandler: true,
    data: { modelId, data },
  });
}

async function pridictData(modelId: number, data: any[]) {
  return request<any>('/api/data/pridict', {
    method: 'POST',
    skipErrorHandler: true,
    data: { modelId, data },
  });
}

async function getCoefficient(modelId: number) {
  return request<any>('/api/data/coefficient',{
    method: 'GET',
    skipErrorHandler: true,
    params:{modelId}
  })
}

async function getIntercept(modelId: number) {
  return request<any>('/api/data/intercept',{
    method: 'GET',
    skipErrorHandler: true,
    params:{modelId}
  })
}

export { getData, addData, dataToJson, addDatas, pridictData,getCoefficient,getIntercept};
