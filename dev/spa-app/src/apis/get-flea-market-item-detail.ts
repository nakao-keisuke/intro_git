import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

/**
 * get_flea_market_item_detail API リクエスト型定義
 *
 * 必須パラメータ:
 * - api: "get_flea_market_item_detail"
 * - item_id: 商品ID
 */
interface GetFleaMarketItemDetailRequest extends JamboRequest {
  readonly api: 'get_flea_market_item_detail';
  readonly item_id: string;
}

/**
 * フリーマーケット商品詳細型定義
 *
 * サーバー側のFleaMarketItem POJOに対応:
 * - item_id: 商品ID
 * - seller_id: 出品者ID
 * - title: 商品タイトル
 * - description: 商品説明
 * - images: 商品画像URL配列
 * - price: 価格
 * - category: カテゴリ
 * - sales_status: 販売ステータス
 * - visibility: 表示状態
 * - review_status: 審査状態
 * - created_at: 作成日時
 * - updated_at: 更新日時
 */
export interface FleaMarketItemDetail extends JamboResponseData {
  readonly item_id: string;
  readonly seller_id: string;
  readonly title: string;
  readonly description: string;
  readonly images: string[];
  readonly price: number;
  readonly category: string;
  readonly sales_status: string;
  readonly visibility?: string;
  readonly review_status?: string;
  readonly created_at: string | number;
  readonly updated_at: string | number;
}

/**
 * フリーマーケット商品詳細 with お気に入り数
 */
export interface FleaMarketItemDetailWithFavorites {
  readonly item: FleaMarketItemDetail;
  readonly fav_count: number;
}

/**
 * get_flea_market_item_detail APIレスポンス型
 *
 * サーバー側では商品が見つからない場合はITEM_NOT_FOUNDエラーを返却
 * 正常時は商品情報とお気に入り数を含むオブジェクトを返却
 */
export type GetFleaMarketItemDetailResponseData =
  FleaMarketItemDetailWithFavorites;

/**
 * get_flea_market_item_detail APIリクエスト作成関数
 *
 * @param itemId - 商品ID
 * @returns GetFleaMarketItemDetailRequest
 */
export function getFleaMarketItemDetailRequest(
  itemId: string,
): GetFleaMarketItemDetailRequest {
  return {
    api: 'get_flea_market_item_detail',
    item_id: itemId,
  };
}
