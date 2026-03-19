import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

/**
 * get_flea_market_item_list API リクエスト型定義
 *
 * 必須パラメータ:
 * - api: "get_flea_market_item_list"
 * - category: 商品カテゴリ
 *
 * オプションパラメータ:
 * - sales_status: 販売ステータス（"on_sale", "sold" - デフォルト: "on_sale", undefinedの場合は全ステータス）
 * - limit: 取得件数制限
 * - page: ページ番号
 * - seller_id: 出品者ID（指定した出品者の商品のみ取得）
 *
 * 注意: テキスト検索機能は現在サポートされていません
 */
interface GetFleaMarketItemListRequest extends JamboRequest {
  readonly api: 'get_flea_market_item_list';
  readonly category: string;
  readonly sales_status?: string;
  readonly limit?: number;
  readonly page?: number;
  readonly seller_id?: string;
  readonly bookmark_only?: boolean;
  readonly user_id?: string;
}

/**
 * フリーマーケット商品アイテム型定義
 *
 * 各商品には以下の情報が含まれます：
 * - item_id: 商品ID
 * - seller_id: 出品者ID
 * - title: 商品タイトル
 * - description: 商品説明
 * - images: 商品画像URL配列
 * - price: 価格
 * - category: カテゴリ
 * - sales_status: 販売ステータス
 * - created_at: 作成日時
 * - updated_at: 更新日時
 */
export interface FleaMarketItem extends JamboResponseData {
  fav_count: number;
  readonly item_id: string;
  readonly seller_id: string;
  readonly title: string;
  readonly description: string;
  readonly images: string[];
  readonly price: number;
  readonly category: string;
  readonly sales_status: string;
  readonly created_at: string | number;
  readonly updated_at: string | number;
}

/**
 * フリーマーケット商品アイテム with お気に入り数
 */
export interface FleaMarketItemWithFavorites {
  readonly item: FleaMarketItem;
  readonly fav_count: number;
}

/**
 * get_flea_market_item_list APIレスポンス型
 * 注意: レスポンスは商品とお気に入り数のペアの配列が返される形式で、ページネーション情報は含まれていません
 */
export type GetFleaMarketItemListResponseData = FleaMarketItemWithFavorites[];

/**
 * get_flea_market_item_list APIリクエスト作成関数
 *
 * @param category - 商品カテゴリ（必須）
 * @param limit - 取得件数制限（デフォルト: 20）
 * @param page - ページ番号（デフォルト: 1）
 * @param salesStatus - 販売ステータス（"on_sale", "sold" - オプション、undefinedで全ステータス取得）
 * @param sellerId - 出品者ID（オプション）
 * @param bookmarkOnly - お気に入りユーザーの商品のみ取得（オプション）
 * @param userId - ユーザーID（bookmarkOnly使用時に必須）
 * @returns GetFleaMarketItemListRequest
 *
 * カテゴリ定義:
 * - all: すべて
 * - panties: パンティー
 * - bras: ブラジャー
 * - bra_and_panty_set: B＆Pセット
 * - clothing: 衣類系
 * - other_intimates: その他下着
 * - request: リクエスト
 * - personal_items: 私物
 * - new_arrivals: 新着
 */
export function getFleaMarketItemListRequest(
  category: string,
  limit: number = 20,
  page: number = 1,
  salesStatus?: string,
  sellerId?: string,
  bookmarkOnly?: boolean,
  userId?: string,
): GetFleaMarketItemListRequest {
  const request: any = {
    api: 'get_flea_market_item_list',
  };

  // categoryは必須パラメータ
  request.category = category;

  // オプショナルなパラメータは値がある場合のみ追加
  if (salesStatus !== undefined) {
    request.sales_status = salesStatus;
  }
  if (limit !== undefined) {
    request.limit = limit;
  }
  if (page !== undefined) {
    request.page = page;
  }
  if (sellerId !== undefined && sellerId !== '') {
    request.seller_id = sellerId;
  }
  if (bookmarkOnly !== undefined) {
    request.bookmark_only = bookmarkOnly;
  }
  if (userId !== undefined && userId !== '') {
    request.user_id = userId;
  }

  return request as GetFleaMarketItemListRequest;
}
