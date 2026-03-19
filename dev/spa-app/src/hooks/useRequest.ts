import { useState } from 'react';
import type { RequestRouteResponse } from '@/apis/http/request';
import {
  HTTP_SEND_CALL_REQUEST,
  HTTP_SEND_IMAGE_REQUEST,
  HTTP_SEND_VIDEO_REQUEST,
} from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { OutgoingCallType } from '@/utils/callView';

type RequestResult = { success: true } | { success: false; error: string };

type UseRequestReturn = {
  requestImage: (partnerId: string) => Promise<RequestResult>;
  requestVideo: (partnerId: string) => Promise<RequestResult>;
  requestCall: (
    partnerId: string,
    callType: OutgoingCallType,
  ) => Promise<RequestResult>;
  isLoading: boolean;
};

export const useRequest = (): UseRequestReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const post = async (url: string, body: object): Promise<RequestResult> => {
    setIsLoading(true);
    try {
      const client = new ClientHttpClient();
      const res = await client.post<RequestRouteResponse>(url, body);
      if (res.type === 'error') {
        return { success: false, error: res.message ?? 'エラーが発生しました' };
      }
      return { success: true };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'エラーが発生しました',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const requestImage = (partnerId: string) =>
    post(HTTP_SEND_IMAGE_REQUEST, { partnerId });
  const requestVideo = (partnerId: string) =>
    post(HTTP_SEND_VIDEO_REQUEST, { partnerId });
  const requestCall = (partnerId: string, callType: OutgoingCallType) =>
    post(HTTP_SEND_CALL_REQUEST, { partnerId, callType });

  return { requestImage, requestVideo, requestCall, isLoading };
};
