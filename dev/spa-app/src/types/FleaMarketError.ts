/**
 * フリーマーケットAPIのエラーレスポンス型定義
 * Javaサーバーから返されるエラーレスポンスの型
 */

/**
 * APIエラーレスポンス
 */
export interface FleaMarketErrorResponse {
  /** エラーコード（数値） */
  code: number;
  /** エラーメッセージ */
  message: string;
  /** データ（エラー時はnull） */
  data: null;
}

/**
 * API成功レスポンス
 */
export interface FleaMarketSuccessResponse<T> {
  /** 成功コード（0） */
  code: 0;
  /** レスポンスデータ */
  data: T;
  /** メッセージ（オプション） */
  message?: string;
}

/**
 * APIレスポンス（成功またはエラー）
 */
export type FleaMarketApiResponse<T> =
  | FleaMarketSuccessResponse<T>
  | FleaMarketErrorResponse;

/**
 * エラーレスポンスかどうかを判定
 */
export function isErrorResponse<T>(
  response: FleaMarketApiResponse<T>,
): response is FleaMarketErrorResponse {
  return response.code !== 0;
}

/**
 * 成功レスポンスかどうかを判定
 */
export function isSuccessResponse<T>(
  response: FleaMarketApiResponse<T>,
): response is FleaMarketSuccessResponse<T> {
  return response.code === 0;
}
