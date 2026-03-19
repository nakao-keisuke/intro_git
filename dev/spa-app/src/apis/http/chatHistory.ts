import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ChatInfo } from '@/types/ChatInfo';
import type { ResponseData } from '@/types/NextApi';

export type GetChatHistoryClientRequest = {
  readonly partnerId: string;
};

export type GetChatHistoryRouteResponse = ResponseData<ChatInfo[]>;

export type GetChatHistoryUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_CHAT_HISTORY;
  readonly token: string;
  readonly frd_id: string;
  readonly time_stamp: string;
  readonly take: number;
};

export type GetOpenedAudioUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_OPENED_AUDIO;
  readonly token: string;
};

export type GetOpenedImageUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_OPENED_IMAGE;
  readonly token: string;
};

export type GetOpenedVideoUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_OPENED_VIDEO;
  readonly token: string;
};

export type ChatHistoryUpstreamData = {
  readonly msgId: string;
  readonly msgType: 'FILE' | 'ABSENCECALL' | 'STK' | 'PP';
  readonly isOwn: boolean;
  readonly readTime: string;
  readonly timeStamp: string;
  readonly content: string;
};

export type OpenedMediaUpstreamData = {
  readonly fileId: string;
};

export type GetChatHistoryUpstreamResponse = APIResponse<
  ChatHistoryUpstreamData[]
>;
export type GetOpenedAudioUpstreamResponse = APIResponse<
  OpenedMediaUpstreamData[]
>;
export type GetOpenedImageUpstreamResponse = APIResponse<
  OpenedMediaUpstreamData[]
>;
export type GetOpenedVideoUpstreamResponse = APIResponse<
  OpenedMediaUpstreamData[]
>;

export const createGetChatHistoryUpstreamRequest = (
  token: string,
  partnerId: string,
): GetChatHistoryUpstreamRequest => ({
  api: JAMBO_API_ROUTE.GET_CHAT_HISTORY,
  token,
  frd_id: partnerId,
  time_stamp: '',
  take: 20,
});

export const createGetOpenedAudioUpstreamRequest = (
  token: string,
): GetOpenedAudioUpstreamRequest => ({
  api: JAMBO_API_ROUTE.GET_OPENED_AUDIO,
  token,
});

export const createGetOpenedImageUpstreamRequest = (
  token: string,
): GetOpenedImageUpstreamRequest => ({
  api: JAMBO_API_ROUTE.GET_OPENED_IMAGE,
  token,
});

export const createGetOpenedVideoUpstreamRequest = (
  token: string,
): GetOpenedVideoUpstreamRequest => ({
  api: JAMBO_API_ROUTE.GET_OPENED_VIDEO,
  token,
});
