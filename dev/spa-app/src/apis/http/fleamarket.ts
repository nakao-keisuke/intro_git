import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

/**
 * ========================================
 * フリマお気に入り追加
 * ========================================
 */

/**
 * client⇔Route Handler のレスポンス型
 */
export type AddFleaMarketFavoriteRouteResponse = ApiRouteResponse<undefined>;

/**
 * Route Handler⇔jambo-server リクエスト型（snake_case）
 */
export type AddFleaMarketFavoriteRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.ADD_FLEA_MARKET_FAVORITE;
  readonly token: string;
  readonly user_id: string;
  readonly item_id: string;
};

/**
 * Route Handler⇔jambo-server レスポンス型
 * 成功時: code = 0
 * 失敗時: code = 9317（自分の商品）, code = 1（不明なエラー）
 */
export type AddFleaMarketFavoriteResponse = APIResponse<null>;

/**
 * Request作成関数
 */
export const createAddFleaMarketFavoriteRequest = (
  token: string,
  userId: string,
  itemId: string,
): AddFleaMarketFavoriteRequest => ({
  api: JAMBO_API_ROUTE.ADD_FLEA_MARKET_FAVORITE,
  token: token,
  user_id: userId,
  item_id: itemId,
});

/**
 * ========================================
 * フリマお気に入り削除
 * ========================================
 */

/**
 * client⇔Route Handler のレスポンス型
 */
export type RemoveFleaMarketFavoriteRouteResponse = ApiRouteResponse<undefined>;

/**
 * Route Handler⇔jambo-server リクエスト型（snake_case）
 */
export type RemoveFleaMarketFavoriteRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.REMOVE_FLEA_MARKET_FAVORITE;
  readonly token: string;
  readonly user_id: string;
  readonly item_id: string;
};

/**
 * Route Handler⇔jambo-server レスポンス型
 * 成功時: code = 0
 * 失敗時: code = 1（不明なエラー）
 */
export type RemoveFleaMarketFavoriteResponse = APIResponse<null>;

/**
 * Request作成関数
 */
export const createRemoveFleaMarketFavoriteRequest = (
  token: string,
  userId: string,
  itemId: string,
): RemoveFleaMarketFavoriteRequest => ({
  api: JAMBO_API_ROUTE.REMOVE_FLEA_MARKET_FAVORITE,
  token: token,
  user_id: userId,
  item_id: itemId,
});
