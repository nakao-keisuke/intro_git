import { getResponseFromNext, postToNextServer } from '@/libs/axios';
import type { ResponseData } from '@/types/NextApi';

export const getFromNext = async <T>(
  endpoint: string,
  debug = false,
): Promise<ResponseData<T>> => {
  const response = await getResponseFromNext(endpoint);
  if (debug) {
    console.log(`endpoint: ${endpoint}`);
    console.log(`response: ${JSON.stringify(response, null, 2)}`);
  }
  return Promise.resolve(response);
};

export const postToNext = async <T>(
  endpoint: string,
  data?: any,
  debug = false,
): Promise<ResponseData<T>> => {
  const response = await postToNextServer(endpoint, data);
  if (debug) {
    console.log(`endpoint: ${endpoint}`);
    console.log(`data: ${JSON.stringify(data, null, 2)}`);
    console.log(`response: ${JSON.stringify(response, null, 2)}`);
  }
  return Promise.resolve(response);
};
