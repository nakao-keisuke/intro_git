import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

/**
 * client ⇔ Route Handler のレスポンス
 * - 成功: { success?: true; data?: PurchaseRouteData }
 * - 失敗: ErrorData（NextApi.ts 準拠）
 */
export type PurchaseRouteData = {
  readonly tradablePoint: number;
  readonly untradablePoint: number;
  readonly point: number;
};
export type PurchaseRouteResponse = ApiRouteResponse<
  PurchaseRouteData | undefined
>;

/**
 * Route Handler ⇔ jambo-server リクエスト定義（snake_case）
 */
export type ViewImageRequest = APIRequest & {
  readonly api: 'view_img';
  readonly token: string;
  readonly img_id: string;
};

export type ViewVideoRequest = APIRequest & {
  readonly api: 'view_video';
  readonly token: string;
  readonly video_id: string;
};

export type PlayAudioRequest = APIRequest & {
  readonly api: 'play_audio';
  readonly token: string;
  readonly audio_id: string;
};

/**
 * リクエスト作成関数
 */
export const createViewImageRequest = (
  token: string,
  imageId: string,
): ViewImageRequest => ({
  api: 'view_img',
  token,
  img_id: imageId,
});

export const createViewVideoRequest = (
  token: string,
  videoId: string,
): ViewVideoRequest => ({
  api: 'view_video',
  token,
  video_id: videoId,
});

export const createPlayAudioRequest = (
  token: string,
  audioId: string,
): PlayAudioRequest => ({
  api: 'play_audio',
  token,
  audio_id: audioId,
});

/**
 * jambo-server レスポンス定義
 * 成功時:
 * {
 *   "code": 0,
 *   "data": {
 *     "tradable_point": 1500,
 *     "untradable_point": 200,
 *     "point": 1700
 *   }
 * }
 * 失敗時: { "code": 70 } など（data は null 相当）
 */
export type PurchaseUpstreamSuccessData = {
  readonly tradable_point: number;
  readonly untradable_point: number;
  readonly point: number;
};

export type PurchaseUpstreamResponse =
  APIResponse<PurchaseUpstreamSuccessData | null>;
