import type { FleaMarketItemWithFavorites } from '@/apis/get-flea-market-item-list';
import type { APIRequest } from '@/libs/http/type';
import type { TransactionWithItem } from '@/types/fleamarket/shared';
import type { Region } from '@/utils/region';

/**
 * プロフィール詳細ページ用（UI層向け）の camelCase 型定義
 * - HTTP クライアントで snake_case → camelCase に変換されたデータ形状に対応
 * - 既存の API 型（snake）とは独立させて共存させる
 * - 例外: お気に入りフラグは is_favorited（snake）のまま維持する
 */
export type FleaMarketItemCamel = {
  itemId: string;
  sellerId: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  category: string;
  salesStatus: string;
  createdAt: string | number;
  updatedAt: string | number;
  // 追加で付与される可能性のあるフィールド（存在しない場合もあるため任意）
  reviewStatus?: string;
};

export type FleaMarketItemWithFavoritesCamel = {
  readonly item: FleaMarketItemCamel;
  readonly favCount: number;
};

// リクエスト型定義
export type GetFleaMarketItemsRequest = APIRequest & {
  token: string;
  sellerId: string;
  category?: string;
  limit?: number;
  page?: number;
  salesStatus?: string;
};

// フリマお気に入りリストリクエスト
export type FleaMarketFavoriteListRequest = APIRequest & {
  token: string;
  page?: number;
  limit?: number;
};

// フリマ取引リストリクエスト
export type FleaMarketTransactionListRequest = APIRequest & {
  token: string;
  user_id: string;
  page?: number;
  limit?: number;
};

// レスポンス型定義（既存の API 由来の snake 型を維持）
export type FleaMarketItemInfo = FleaMarketItemWithFavorites;

// お気に入りフラグ付き商品型
export type FleaMarketItemWithFavoritedFlag = FleaMarketItemWithFavorites & {
  is_favorited: boolean;
  favCount: number;
};

/**
 * プロフィール詳細ページ用：
 * camelCase 版のお気に入りフラグ付き商品型
 * - is_favorited は例外として snake を踏襲
 */
export type FleaMarketItemWithFavoritedFlagCamel =
  FleaMarketItemWithFavoritesCamel & {
    is_favorited: boolean;
  };

export type FleaMarketItemsResponse = {
  items: FleaMarketItemInfo[];
  totalCount?: number;
  hasMore?: boolean;
};

// camelCase版レスポンス型（HTTPクライアントの自動変換後の実データ構造）
export type FleaMarketItemsResponseCamel = {
  items: FleaMarketItemWithFavoritesCamel[];
  totalCount?: number;
  hasMore?: boolean;
};

// フリマお気に入りリストレスポンス
export type FleaMarketFavoriteListResponse = {
  favorites: FleaMarketItemWithFavorites[];
  totalCount?: number;
  hasMore?: boolean;
};

// フリマ取引リストレスポンス
export type FleaMarketTransactionListResponse = {
  transactions: TransactionWithItem[];
  totalCount?: number;
  hasMore?: boolean;
};

// フリマメインページレスポンス
export type FleaMarketMainResponse = {
  items: FleaMarketItemWithFavorites[];
  favorites: FleaMarketItemWithFavorites[];
  transactions: TransactionWithItem[];
  totalItems: number;
  totalFavorites: number;
  totalTransactions: number;
};

// camelCase版メインページレスポンス（HTTPクライアントの自動変換後の実データ構造）
export type FleaMarketMainResponseCamel = {
  items: FleaMarketItemWithFavoritesCamel[];
  favorites: FleaMarketItemWithFavoritesCamel[];
  transactions: TransactionWithItem[];
  totalItems: number;
  totalFavorites: number;
  totalTransactions: number;
};

// ユーザー情報型（Board実装と統一）
export type FleaMarketSellerInfo = {
  userId: string;
  userName: string;
  avatarId: string;
  age: number;
  region: Region;
  hLevel?: string;
  bustSize?: string;
};

// エラー型
export type FleaMarketError = {
  code: number;
  message: string;
  details?: any;
};
