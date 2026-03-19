import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { Region } from '@/utils/region';

// ============================================
// マイユーザー情報取得API
// ============================================

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Client
// ──────────────────────────────────────────

/**
 * マイユーザー情報取得リクエスト（Client → Route Handler）
 * ボディは不要（セッションから認証情報を取得）
 */
export type GetMyUserInfoRequest = Record<string, never>;

/**
 * マイユーザー情報取得レスポンス（Route Handler → Client）
 * ResponseData<T>型でラップされる
 */
export type GetMyUserInfoResponse = {
  userId: string;
  userName: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  avatarId: string;
  age: number;
  point: number;
  isRegisteredEmail: boolean;
  hobby: number[];
  token: string;
  region?: Region;
  regDate?: string;
  bustSize?: string;
  hLevel?: string;
  isFirstBonusCourseExist?: boolean;
  isSecondBonusCourseExist?: boolean;
  isThirdBonusCourseExist?: boolean;
  isFourthBonusCourseExist?: boolean;
};

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Jambo (ユーザー情報取得)
// ──────────────────────────────────────────

/**
 * ユーザー情報取得リクエスト（Route Handler → Jambo）
 */
export type GetUserInfoJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_USER_INFO;
  token: string;
};

/**
 * ユーザー情報取得レスポンス（Jambo → Route Handler）
 */
export type GetUserInfoJamboResponse = {
  code: number;
  data?: {
    user_id: string;
    user_name: string;
    voice_call_waiting: boolean;
    video_call_waiting: boolean;
    ava_id: string;
    age: number;
    point: number;
    email?: string;
    inters: number[];
    region?: number;
    reg_date?: string;
    bust_size?: string;
    h_level?: string;
  };
  message?: string;
};

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Jambo (購入コース情報取得)
// ──────────────────────────────────────────

/**
 * 購入コース情報取得リクエスト（Route Handler → Jambo）
 */
export type GetCreditPurchaseCourseJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_CREDIT_PURCHASE_COURSE_INFO;
  token: string;
};

/**
 * 購入コース情報取得レスポンス（Jambo → Route Handler）
 */
export type GetCreditPurchaseCourseJamboResponse = {
  code: number;
  data?: {
    can_buy_first_bonus_course?: boolean;
    can_buy_second_bonus_course?: boolean;
    can_buy_third_bonus_course?: boolean;
    can_buy_fourth_bonus_course?: boolean;
  } | null;
  message?: string;
};

// ──────────────────────────────────────────
// リクエスト作成関数
// ──────────────────────────────────────────

/**
 * Jambo API用のユーザー情報取得リクエストを作成
 */
export const createGetUserInfoJamboRequest = (
  token: string,
): GetUserInfoJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_USER_INFO,
  token,
});

/**
 * Jambo API用の購入コース情報取得リクエストを作成
 */
export const createGetCreditPurchaseCourseJamboRequest = (
  token: string,
): GetCreditPurchaseCourseJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_CREDIT_PURCHASE_COURSE_INFO,
  token,
});
