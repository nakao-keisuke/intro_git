import type { FleaMarketItem } from '@/apis/get-flea-market-item-list';
import type { JamboResponseData } from '@/types/JamboApi';

/**
 * フリマ出品者データ
 */
export interface FleaMarketSellerData extends JamboResponseData {
  readonly user_id: string;
  readonly user_name: string;
  readonly ava_id?: string;
  readonly abt?: string;
  readonly age?: number;
  readonly region?: number;
  readonly reg_date?: string;
  readonly last_login_time_from_user_collection?: string;
}

/**
 * お気に入り商品のアイテム情報
 */
export interface FavoriteItem {
  item_id: string;
  favorite_id: string;
  created_at: number;
  item_info: FleaMarketItem;
  seller_info: FleaMarketSellerData;
  fav_count?: number;
}

/**
 * お気に入りリスト取得APIのレスポンス
 */
export interface FavoriteListResponse {
  code: number;
  data: FavoriteItem[] | null;
  message?: string;
}

/**
 * お気に入り操作（追加・削除）APIのレスポンス
 */
export interface FavoriteActionResponse {
  type: 'success' | 'error';
  message?: string;
}

/**
 * お気に入りリスト内の商品情報（簡略版）
 */
export interface FavoriteItemInList {
  item_id: string;
  favorite_id: string;
  created_at: number;
  item_info?: {
    item_id: string;
    title: string;
    price: number;
    images?: string[];
    sales_status: string;
  };
  seller_info?: FleaMarketSellerData;
}

/**
 * お気に入りリスト取得APIのレスポンス（詳細版）
 */
export interface FavoriteListApiResponse {
  type: 'success' | 'error';
  code: number;
  data: FavoriteItemInList[] | { items?: FavoriteItemInList[] } | null;
  message?: string;
}
