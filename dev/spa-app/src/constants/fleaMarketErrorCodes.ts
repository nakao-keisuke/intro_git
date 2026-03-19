/**
 * フリーマーケットAPIエラーコード定数
 * サーバー側のJavaエラーコードに対応
 *
 * 使用例:
 * import {
 *   FLEA_MARKET_ERROR_CODES,
 *   getFleaMarketErrorMessage,
 *   isFleaMarketError,
 *   getFleaMarketErrorKey,
 *   getFleaMarketErrorValue
 * } from '@/constants/fleaMarketErrorCodes';
 *
 * // 数値での判定
 * if (errorCode === FLEA_MARKET_ERROR_CODES.ITEM_NOT_FOUND) {
 *   // エラー処理
 * }
 *
 * // キー名での判定
 * if (isFleaMarketError(errorCode, 'ITEM_NOT_FOUND')) {
 *   // エラー処理
 * }
 *
 * // メッセージ取得（数値/キー名どちらでも可）
 * const message1 = getFleaMarketErrorMessage(9300);
 * const message2 = getFleaMarketErrorMessage('ITEM_NOT_FOUND');
 *
 * // キー名取得
 * const key = getFleaMarketErrorKey(9300); // "ITEM_NOT_FOUND"
 *
 * // 数値取得
 * const value = getFleaMarketErrorValue('ITEM_NOT_FOUND'); // 9300
 */
export const FLEA_MARKET_ERROR_CODES = {
  ITEM_NOT_FOUND: 9300,
  ITEM_NOT_AVAILABLE: 9301,
  CANNOT_BUY_OWN_ITEM: 9302,
  TRANSACTION_NOT_FOUND: 9303,
  INVALID_TRANSACTION_STATUS: 9304,
  INVALID_ITEM_TITLE: 9305,
  INVALID_ITEM_DESCRIPTION: 9306,
  INVALID_ITEM_IMAGES: 9307,
  INVALID_ITEM_PRICE: 9308,
  INVALID_ITEM_CATEGORY: 9309,
  ITEM_NOT_EDITABLE: 9310,
  ITEM_NOT_DELETABLE: 9311,
  SHIPMENT_NOT_FOUND: 9312,
  INVALID_SHIPPING_STATUS: 9313,
  INVALID_CARRIER: 9314,
  INVALID_TRACKING_NUMBER: 9315,
  NO_SELLERS_FOUND: 9316,
  CANNOT_FAVORITE_OWN_ITEM: 9317,
  ERR_INVALID_BUYER_GENDER: 9318,
  INSUFFICIENT_POINTS: 9319,
} as const;

/**
 * エラーコードのキー名を取得
 * @param errorCode - エラーコード（数値）
 * @returns 対応するキー名
 */
export function getFleaMarketErrorKey(errorCode: number): string | null {
  const entry = Object.entries(FLEA_MARKET_ERROR_CODES).find(
    ([, value]) => value === errorCode,
  );
  return entry ? entry[0] : null;
}

/**
 * エラーコードキーから数値を取得
 * @param errorKey - エラーコードキー（文字列）
 * @returns 対応するエラーコード数値
 */
export function getFleaMarketErrorValue(errorKey: string): number | null {
  return (
    FLEA_MARKET_ERROR_CODES[errorKey as keyof typeof FLEA_MARKET_ERROR_CODES] ||
    null
  );
}

/**
 * エラーコードの判定（数値またはキー名で判定）
 * @param error - エラーコード（数値）またはキー名（文字列）
 * @param targetError - 比較対象のエラーコードキー
 * @returns 判定結果
 */
export function isFleaMarketError(
  error: number | string,
  targetError: keyof typeof FLEA_MARKET_ERROR_CODES,
): boolean {
  const targetValue = FLEA_MARKET_ERROR_CODES[targetError];

  if (typeof error === 'number') {
    return error === targetValue;
  } else if (typeof error === 'string') {
    // 文字列の場合はキー名として比較
    return error === targetError;
  }

  return false;
}

/**
 * エラーコードに対応する日本語メッセージを取得（数値またはキー名対応）
 * @param error - エラーコード（数値）またはキー名（文字列）
 * @returns 対応する日本語エラーメッセージ
 */
export function getFleaMarketErrorMessage(error: number | string): string {
  let errorCode: number;

  if (typeof error === 'string') {
    errorCode = getFleaMarketErrorValue(error) || 0;
  } else {
    errorCode = error;
  }

  switch (errorCode) {
    case FLEA_MARKET_ERROR_CODES.ITEM_NOT_FOUND:
      return '指定された商品が見つかりません';
    case FLEA_MARKET_ERROR_CODES.ITEM_NOT_AVAILABLE:
      return '商品が利用できません';
    case FLEA_MARKET_ERROR_CODES.CANNOT_BUY_OWN_ITEM:
      return '自分の商品は購入できません';
    case FLEA_MARKET_ERROR_CODES.TRANSACTION_NOT_FOUND:
      return '取引が見つかりません';
    case FLEA_MARKET_ERROR_CODES.INVALID_TRANSACTION_STATUS:
      return '無効な取引ステータスです';
    case FLEA_MARKET_ERROR_CODES.INVALID_ITEM_TITLE:
      return '商品タイトルが無効です';
    case FLEA_MARKET_ERROR_CODES.INVALID_ITEM_DESCRIPTION:
      return '商品説明が無効です';
    case FLEA_MARKET_ERROR_CODES.INVALID_ITEM_IMAGES:
      return '商品画像が無効です';
    case FLEA_MARKET_ERROR_CODES.INVALID_ITEM_PRICE:
      return '商品価格が無効です';
    case FLEA_MARKET_ERROR_CODES.INVALID_ITEM_CATEGORY:
      return '無効なカテゴリです';
    case FLEA_MARKET_ERROR_CODES.ITEM_NOT_EDITABLE:
      return '商品を編集できません';
    case FLEA_MARKET_ERROR_CODES.ITEM_NOT_DELETABLE:
      return '商品を削除できません';
    case FLEA_MARKET_ERROR_CODES.SHIPMENT_NOT_FOUND:
      return '配送情報が見つかりません';
    case FLEA_MARKET_ERROR_CODES.INVALID_SHIPPING_STATUS:
      return '無効な配送ステータスです';
    case FLEA_MARKET_ERROR_CODES.INVALID_CARRIER:
      return '無効な配送業者です';
    case FLEA_MARKET_ERROR_CODES.INVALID_TRACKING_NUMBER:
      return '無効な追跡番号です';
    case FLEA_MARKET_ERROR_CODES.NO_SELLERS_FOUND:
      return '出品者が見つかりません';
    case FLEA_MARKET_ERROR_CODES.CANNOT_FAVORITE_OWN_ITEM:
      return '自分の商品をお気に入りに追加できません';
    case FLEA_MARKET_ERROR_CODES.ERR_INVALID_BUYER_GENDER:
      return '購入者の性別が無効です';
    case FLEA_MARKET_ERROR_CODES.INSUFFICIENT_POINTS:
      return 'ポイントが不足しています';
    default:
      return 'エラーが発生しました';
  }
}

/**
 * エラーコード型定義
 */
export type FleaMarketErrorCode =
  (typeof FLEA_MARKET_ERROR_CODES)[keyof typeof FLEA_MARKET_ERROR_CODES];

/**
 * numberを整数に変換（整数値に丸める）
 * @param code - エラーコード
 * @returns 整数値
 */
export function toInteger(code: number): number {
  return Math.floor(code);
}
