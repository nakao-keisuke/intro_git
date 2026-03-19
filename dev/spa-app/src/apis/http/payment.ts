import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';

// ──────────────────────────────────────────
// 型定義: Client ⇔ Route Handler (Alvion クイックチャージ)
// ──────────────────────────────────────────

/** クライアントからのクイックチャージリクエスト */
export type QuickChargeRequest = {
  money: number; // 課金額
  point: number; // 付与ポイント
};

/**
 * Route Handler からクライアントへのレスポンス (camelCase)
 * typeフィールドはResponseDataが追加するため含めない
 */
export type QuickChargeResponse = {
  paymentIntentId?: string;
  status?: string;
  message?: string;
  point?: number;
  notification?: object;
};

/**
 * Alvion API からのレスポンス (snake_case)
 * Route Handler内でcamelCaseに変換する
 */
export type AlvionQuickChargeResponse = {
  type: 'success' | 'error';
  payment_intent_id?: string;
  status?: string;
  message?: string;
  point?: number;
  notification?: object;
};

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Jambo
// ──────────────────────────────────────────

/** ユーザー情報取得 Jambo API リクエスト */
export type GetUserInfoJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_USER_INFO;
  token: string;
};

/** ユーザー情報 Jambo API レスポンス */
export type GetUserInfoJamboResponse = {
  code: number;
  data?: {
    user_id: string;
    user_name: string;
    ava_id: number;
    age: number;
    point: number;
    paydoor_recurring_token?: string; // Paydoor決済トークン
  };
  message?: string;
};

/** ポイント追加 Jambo API リクエスト */
export type AddPointJamboRequest = {
  api: typeof JAMBO_API_ROUTE.ADD_POINT;
  token: string;
  id: string;
  tradable_point: number;
  untradable_point: 0;
  point_type: 258;
  money: number;
};

/** ポイント追加 Jambo API レスポンス */
export type AddPointJamboResponse = {
  code: number;
  data?: Record<string, unknown>;
  message?: string;
};

// ──────────────────────────────────────────
// Alvion クイックチャージ (Route Handler → Alvion API)
// ──────────────────────────────────────────

/** Route Handler → Alvion API リクエスト */
export type AlvionQuickChargeRequest = {
  token: string;
  amount: number;
  point: number;
};

// ──────────────────────────────────────────
// リクエスト作成関数
// ──────────────────────────────────────────

export const createGetUserInfoJamboRequest = (
  token: string,
): GetUserInfoJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_USER_INFO,
  token,
});

export const createAddPointJamboRequest = (
  token: string,
  userId: string,
  tradablePoint: number,
  money: number,
): AddPointJamboRequest => ({
  api: JAMBO_API_ROUTE.ADD_POINT,
  token,
  id: userId,
  tradable_point: tradablePoint,
  untradable_point: 0,
  point_type: 258,
  money,
});

/**
 * Alvion クイックチャージリクエスト作成関数
 */
export const createAlvionQuickChargeRequest = (
  token: string,
  money: number,
  point: number,
): AlvionQuickChargeRequest => ({
  token,
  amount: money,
  point,
});
