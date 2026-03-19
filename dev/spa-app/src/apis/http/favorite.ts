import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

/**
 * client⇔Route Handler のレスポンス型（成功/失敗の統一表現）
 * - 成功時: type?: 'success', success?: boolean, data?: T
 * - 失敗時: ErrorData（ResponseDataに従う）
 */
export type AddFavoriteRouteData = {
  readonly isUnlock: 0 | 1;
  readonly isFavorited: 0 | 1;
};

export type AddFavoriteRouteResponse = ApiRouteResponse<
  AddFavoriteRouteData | undefined
>;

/**
 * Route Handler⇔jambo-serverへのいいね追加リクエスト/レスポンス型定義
 */
// Request型定義（snake_case）
export type AddFavoriteRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.ADD_FAV;
  readonly token: string;
  readonly req_user_id: string;
};

// Response型定義（成功時/失敗時）
// 成功時: code = 0, data = { isUnlock, isFavorited }
// 失敗時: code != 0, data = null（APIResponse の T に null を許容）
export type AddFavoriteSuccessData = {
  readonly isUnlock: 0 | 1; // 1 = 解除済み, 0 = 未解除
  readonly isFavorited: 0 | 1; // 1 = いいね済み
};

export type AddFavoriteResponse = APIResponse<AddFavoriteSuccessData | null>;

// Request作成関数
export const createAddFavoriteRequest = (
  token: string,
  partnerId: string,
): AddFavoriteRequest => ({
  api: JAMBO_API_ROUTE.ADD_FAV,
  token,
  req_user_id: partnerId,
});
