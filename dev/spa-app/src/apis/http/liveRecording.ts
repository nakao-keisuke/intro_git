import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';
import { region } from '@/utils/region';

/**
 * channelInfo の型定義（CamelCase - クライアント向け）
 */
export type ChannelInfo = {
  readonly userCount: number;
  readonly broadcasterId: string;
  readonly talkTheme: string;
  readonly customThumbnailId: string;
  readonly rtcChannelToken: string;
  readonly title: string;
  readonly channelType: string;
  readonly channelId: string;
  readonly appId: string;
  readonly callType: string;
  readonly rtmChannelToken: string;
};

/**
 * 配信者情報の型定義
 */
export type BroadcasterInfo = {
  readonly userId: string;
  readonly avaId: string;
  readonly name: string;
  readonly region: string;
  readonly age: number;
  readonly bustSize: string;
  readonly hasRemoteVibe: boolean;
};

/**
 * client⇔Route Handler のレスポンス型（成功/失敗の統一表現）
 */
export type GetActiveLiveRecordingRouteData = {
  readonly recordingId: string;
  readonly broadcasterId: string;
  readonly channelInfo: ChannelInfo;
  readonly broadcasterInfo?: BroadcasterInfo;
};

export type GetActiveLiveRecordingRouteResponse =
  ApiRouteResponse<GetActiveLiveRecordingRouteData | null>;

/**
 * Route Handler⇔jambo-serverへのアクティブライブ録画取得リクエスト/レスポンス型定義
 */
// Request型定義（snake_case）
export type GetActiveLiveRecordingRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_ACTIVE_LIVE_RECORDING;
  readonly token: string;
};

// Response型定義（camelCase - serverHttpClientが自動変換後のレスポンス）
export type GetActiveLiveRecordingResponseData = {
  readonly recordingId: string;
  readonly broadcasterId: string;
  readonly channelInfo: ChannelInfo;
};

export type GetActiveLiveRecordingResponse =
  APIResponse<GetActiveLiveRecordingResponseData | null>;

// Request作成関数
export const createGetActiveLiveRecordingRequest = (
  token: string,
): GetActiveLiveRecordingRequest => ({
  api: JAMBO_API_ROUTE.GET_ACTIVE_LIVE_RECORDING,
  token,
});

/**
 * Route Handler⇔jambo-server への get-user-info リクエスト/レスポンス型定義
 */
// Request型定義（snake_case）
export type GetBroadcasterInfoRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_USER_INFO_FOR_WEB;
  readonly token: string;
  readonly user_id: string;
  readonly req_user_id: string;
};

// Response型定義（camelCase - serverHttpClientが自動変換後のレスポンス）
export type GetBroadcasterInfoResponseData = {
  readonly userName: string;
  readonly age: number;
  readonly region: number;
  readonly bustSize?: string;
  readonly hasLovense?: boolean;
  readonly avaId?: string;
};

export type GetBroadcasterInfoResponse =
  APIResponse<GetBroadcasterInfoResponseData>;

// Request作成関数
export const createGetBroadcasterInfoRequest = (
  token: string,
  userId: string,
  broadcasterId: string,
): GetBroadcasterInfoRequest => ({
  api: JAMBO_API_ROUTE.GET_USER_INFO_FOR_WEB,
  token,
  user_id: userId,
  req_user_id: broadcasterId,
});

// レスポンスから BroadcasterInfo への変換関数
export const convertToBroadcasterInfo = (
  data: GetBroadcasterInfoResponseData,
  broadcasterId: string,
): BroadcasterInfo => ({
  userId: broadcasterId,
  avaId: data.avaId ?? '',
  name: data.userName,
  age: data.age,
  region: region(data.region),
  bustSize: data.bustSize ?? '',
  hasRemoteVibe: data.hasLovense ?? false,
});
