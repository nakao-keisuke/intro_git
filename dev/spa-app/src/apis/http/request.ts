// src/apis/http/request.ts

import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';
import type { OutgoingCallType } from '@/utils/callView';

// Client ⇔ Route Handler 統一レスポンス
export type RequestRouteResponse = ApiRouteResponse<undefined>;

// 画像/動画リクエスト
export type SendImageRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.SEND_IMAGE_REQUEST;
  readonly token: string;
  readonly rcv_id: string;
};

export type SendVideoRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.SEND_VIDEO_REQUEST;
  readonly token: string;
  readonly rcv_id: string;
};

export const createSendImageRequest = (
  token: string,
  partnerId: string,
): SendImageRequest => ({
  api: JAMBO_API_ROUTE.SEND_IMAGE_REQUEST,
  token,
  rcv_id: partnerId,
});

export const createSendVideoRequest = (
  token: string,
  partnerId: string,
): SendVideoRequest => ({
  api: JAMBO_API_ROUTE.SEND_VIDEO_REQUEST,
  token,
  rcv_id: partnerId,
});

// 通話系は共通API: send_call_request_from_web
export type SendCallRequestFromWebRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.SEND_CALL_REQUEST_FROM_WEB;
  readonly user_id: string;
  readonly rcv_id: string;
  readonly content: string;
  readonly token: string;
};

export type RequestUpstreamResponse = APIResponse<null>;

const callDisplayText = (callType: OutgoingCallType) => {
  switch (callType) {
    case 'videoCallFromOutgoing':
      return 'ビデオ通話';
    case 'voiceCallFromOutgoing':
      return '音声通話';
    case 'videoChatFromOutgoing':
      return 'ビデオチャット';
    default:
      return '';
  }
};

export const createSendCallRequestFromWebRequest = (
  token: string,
  userId: string,
  partnerId: string,
  callType: OutgoingCallType,
): SendCallRequestFromWebRequest => {
  const callText = callDisplayText(callType);
  return {
    api: JAMBO_API_ROUTE.SEND_CALL_REQUEST_FROM_WEB,
    user_id: userId,
    rcv_id: partnerId,
    content: `${callText}をリクエストしました✨\n{{name}}さん、${callText}しましょう♪`,
    token,
  };
};
