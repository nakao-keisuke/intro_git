import axios, { type AxiosResponse } from 'axios';
import {
  createNeverResolvingPromise,
  handleInvalidTokenForClient,
} from '@/utils/invalidTokenHandler';

const jamboApi = axios.create({
  baseURL: import.meta.env.API_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

const nextApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

const stfApi = axios.create({
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Language': 'en-US',
  },
  baseURL: import.meta.env.VITE_STF_URL as string,
  withCredentials: false,
});

export async function postToStfServer(
  endpoint: string,
  data: any,
): Promise<any> {
  try {
    const axiosResponse: AxiosResponse<any> = await stfApi.post(
      endpoint,
      data,
      {
        timeout: 15000,
      },
    );
    return axiosResponse.data;
  } catch (error) {
    console.log('error', error);
    return Promise.resolve({
      type: 'error',
      message: 'サーバーとの通信に失敗しました',
    });
  }
}

export async function postToMainServer(
  request: Object,
  endpoint: string,
): Promise<any> {
  try {
    const axiosResponse: AxiosResponse<any> = await jamboApi.post(
      endpoint,
      request,
      { timeout: 10000 },
    );
    return axiosResponse.data;
  } catch (error) {
    console.log('error', error);
    return Promise.resolve({
      type: 'error',
      message: 'サーバーとの通信に失敗しました',
    });
  }
}

export async function getResponseFromNext(endpoint: string): Promise<any> {
  try {
    const axiosResponse: AxiosResponse<any> = await nextApi.get(endpoint, {
      timeout: 10000,
    });

    // トークン無効化時は/reauthにリダイレクト
    if (handleInvalidTokenForClient(axiosResponse.data)) {
      return createNeverResolvingPromise();
    }

    return axiosResponse.data;
  } catch (error) {
    console.log('error', error);
    return Promise.resolve({
      type: 'error',
      message: 'サーバーとの通信に失敗しました',
    });
  }
}

export async function postToNextServer(
  endpoint: string,
  data: any,
): Promise<any> {
  try {
    const axiosResponse: AxiosResponse<any> = await nextApi.post(
      endpoint,
      data,
      { timeout: 10000 },
    );

    // トークン無効化時は/reauthにリダイレクト
    if (handleInvalidTokenForClient(axiosResponse.data)) {
      return createNeverResolvingPromise();
    }

    return axiosResponse.data;
  } catch (error) {
    console.log('error', error);
    return Promise.resolve({
      type: 'error',
      message: 'サーバーとの通信に失敗しました',
    });
  }
}
