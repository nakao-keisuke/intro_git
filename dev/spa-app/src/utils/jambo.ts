import type { IncomingMessage } from 'node:http';
import type { RequestInternal } from 'next-auth';
import { postToMainServer } from '@/libs/axios';
import type {
  JamboRequest,
  JamboResponse,
  JamboResponseData,
} from '@/types/JamboApi';
import { extractClientIp } from './ip';

export const postToJambo = async <
  T extends JamboResponseData | JamboResponseData[],
>(
  request: JamboRequest,
  requestFromClient:
    | IncomingMessage
    | Pick<RequestInternal, 'body' | 'query' | 'headers' | 'method'>,
): Promise<JamboResponse<T>> => {
  const ip = extractClientIp(requestFromClient.headers);
  if (!ip) {
    console.log('IPアドレスの取得に失敗しました');
    console.log(requestFromClient);
    return Promise.resolve({ code: 1 });
  }
  if (request.api === 'dummy') return Promise.resolve({ code: 1 });
  const response = await postToMainServer({ ...request, ip }, '/');

  // InvalidToken（code:3）の場合は、errorCode:401を含むレスポンスを返す
  // クライアント側のaxios/fetchでこれを検知して/reauthにリダイレクトする
  if (response.code === 3) {
    return Promise.resolve({
      code: 3,
      errorCode: 401,
      type: 'error',
    } as JamboResponse<T>);
  }

  return Promise.resolve(response);
};

export const postToJamboWithoutIp = async <
  T extends JamboResponseData | JamboResponseData[],
>(
  request: JamboRequest,
): Promise<JamboResponse<T>> => {
  const response = await postToMainServer(request, '/');
  if (request.api === 'dummy') return Promise.resolve({ code: 1 });

  // InvalidToken（code:3）の場合は、errorCode:401を含むレスポンスを返す
  if (response.code === 3) {
    return Promise.resolve({
      code: 3,
      errorCode: 401,
      type: 'error',
    } as JamboResponse<T>);
  }

  return Promise.resolve(response);
};
