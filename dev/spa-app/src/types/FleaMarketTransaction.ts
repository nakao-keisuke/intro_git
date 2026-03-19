/**
 * フリーマーケット取引詳細ページ用の型定義
 */

import type { FleaMarketTransactionDetail } from '@/apis/get-flea-market-transaction-detail';
import type { FleaMarketTransactionListItem } from '@/apis/get-flea-market-transaction-list';
import type { GetUserInfoForWebResponseData } from '@/apis/get-user-inf-for-web';

/**
 * 配送履歴のアイテム
 */
export interface ShippingHistoryItem {
  status: string;
  timestamp: string;
  note?: string;
}

/**
 * 拡張された取引詳細（配送情報を含む）
 */
export interface TransactionDetailExtended extends FleaMarketTransactionDetail {
  estimated_delivery?: string | null;
  shipping_address?: string | null;
  shipping_history?: ShippingHistoryItem[];
  shipping_id?: string;
}

/**
 * APIから返される取引データの構造
 */
export interface TransactionData {
  transaction_id: string;
  item_id: string;
  seller_id: string;
  buyer_id: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * APIから返される商品情報の構造
 */
export interface ItemInfo {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

/**
 * 取引詳細APIのレスポンス構造
 */
export interface TransactionDetailApiResponse {
  transaction?: TransactionData;
  item_info?: ItemInfo;
  estimated_delivery?: string;
  shipping_address?: string;
  shipping_history?: ShippingHistoryItem[];
}

/**
 * 取引詳細APIの完全なレスポンス（エラーまたは成功）
 */
export type TransactionDetailResponse =
  | {
      type: 'error';
      message?: string;
    }
  | (TransactionDetailApiResponse & {
      code: number;
      data?: TransactionDetailApiResponse;
    });

/**
 * ユーザー情報APIレスポンスの簡略版
 */
export type UserInfoForWebResponse = Pick<
  GetUserInfoForWebResponseData,
  'user_name'
> & {
  userName?: string; // サーバーがキャメルケースで返す場合もある
};

/**
 * 型ガード：エラーレスポンスかどうかを判定
 */
export function isTransactionErrorResponse(
  response: unknown,
): response is { type: 'error'; message?: string } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'type' in response &&
    (response as Record<string, unknown>).type === 'error'
  );
}

/**
 * 型ガード：成功レスポンスかどうかを判定
 */
export function isTransactionSuccessResponse(
  response: unknown,
): response is TransactionDetailApiResponse & {
  code: 0;
  data?: TransactionDetailApiResponse;
} {
  return (
    typeof response === 'object' &&
    response !== null &&
    'code' in response &&
    (response as Record<string, unknown>).code === 0
  );
}

/**
 * 型ガード：ユーザー名が含まれているかを判定
 */
export function hasUserName(
  response: unknown,
): response is UserInfoForWebResponse & { userName: string } {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  const obj = response as Record<string, unknown>;
  // userNameまたはuser_nameのいずれかが文字列として存在するかチェック
  return (
    (typeof obj.userName === 'string' && obj.userName.length > 0) ||
    (typeof obj.user_name === 'string' && obj.user_name.length > 0)
  );
}

/**
 * 型ガード：有効な取引データが含まれているかを判定
 */
export function hasValidTransactionData(
  response: TransactionDetailResponse | TransactionDetailApiResponse,
): boolean {
  if ('type' in response && response.type === 'error') {
    return false;
  }

  const responseData =
    'data' in response
      ? (
          response as TransactionDetailApiResponse & {
            data?: TransactionDetailApiResponse;
          }
        ).data
      : response;
  return !!(
    responseData &&
    'transaction' in responseData &&
    responseData.transaction &&
    'item_info' in responseData &&
    responseData.item_info
  );
}

/**
 * レスポンスからユーザー名を取得するヘルパー関数
 */
export function extractUserName(
  response: UserInfoForWebResponse,
): string | null {
  if ('userName' in response && response.userName) {
    return response.userName;
  }
  if ('user_name' in response && response.user_name) {
    return response.user_name;
  }
  return null;
}

/**
 * 取引とアイテム情報を含む型（FleaMarketItemDetailコンポーネント用）
 */
export interface TransactionWithItem {
  transaction: FleaMarketTransactionListItem;
  item?: {
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
  };
}

/**
 * 実際の取引リストAPIレスポンスデータ（FleaMarketItemDetailコンポーネント用）
 */
export interface ActualTransactionListResponseData {
  transactions: TransactionWithItem[];
  total: number;
}
