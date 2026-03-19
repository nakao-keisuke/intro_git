import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

// ===============================
// Route Handler ⇔ Client の型定義
// ===============================

// 更新API用のリクエストボディ（Client → Route Handler）
export type UpdateCallWaitingRequestBody = {
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
};

// Route Handler ⇔ Client のレスポンス型
export type UpdateCallWaitingRouteResponse = ApiRouteResponse<undefined>;

// ===============================
// Route Handler ⇔ Jambo の型定義
// ===============================

// Jambo向け更新リクエスト（snake_case）
export type UpdateCallWaitingJamboRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.UPDATE_CALL_WAITING;
  readonly token: string;
  readonly voice_call_waiting: boolean;
  readonly video_call_waiting: boolean;
  readonly offline_call: boolean;
};

// Jamboからのレスポンス（camelCase）
export type UpdateCallWaitingJamboResponseData = null;

export type UpdateCallWaitingUpstreamResponse =
  APIResponse<UpdateCallWaitingJamboResponseData>;

// ===============================
// リクエスト作成関数
// ===============================

export const createUpdateCallWaitingRequest = (
  token: string,
  body: UpdateCallWaitingRequestBody,
): UpdateCallWaitingJamboRequest => ({
  api: JAMBO_API_ROUTE.UPDATE_CALL_WAITING,
  token,
  voice_call_waiting: body.voiceCallWaiting,
  video_call_waiting: body.videoCallWaiting,
  offline_call: true, // 既存の実装と同じく固定値
});
