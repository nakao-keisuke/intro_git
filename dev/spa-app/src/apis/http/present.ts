import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';

// ──────────────────────────────────────────
// 型定義: Client ⇔ Route Handler
// ──────────────────────────────────────────

/** プレゼントメニュー一覧取得リクエスト */
export type GetPresentMenuListRequest = {
  partner_id: string;
};

/** プレゼントメニュー項目 */
export type PresentMenuItem = {
  consumePoint: number;
  index: number;
  type: string;
  text: string;
};

/** プレゼントメニュー一覧取得レスポンス */
export type GetPresentMenuListResponse = {
  menuList: PresentMenuItem[];
};

/** プレゼント送付ポイント消費リクエスト */
export type PayPresentMenuPointRequest = {
  partner_id: string;
  text: string;
  consume_point: number;
  type: string;
  call_type: 'live' | 'side_watch' | 'video';
};

/** プレゼント送付ポイント消費レスポンス */
export type PayPresentMenuPointResponse = {
  myPoint: number;
  partnerPoint: number;
};

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Jambo
// ──────────────────────────────────────────

/** Jambo: プレゼントメニュー一覧取得リクエスト */
export type GetPresentMenuListJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_VIDEO_CHAT_MENU_LIST;
  token: string;
  partner_id: string;
};

/** Jambo: プレゼントメニュー項目（serverHttpClientがcamelCase変換後） */
type JamboPresentMenuItem = {
  consumePoint: number;
  index: number;
  type: string;
  text: string;
};

/** Jambo: プレゼントメニュー一覧取得レスポンス（serverHttpClientがcamelCase変換後） */
export type GetPresentMenuListJamboResponse = {
  code: number;
  data: {
    menuList: JamboPresentMenuItem[];
  };
  message?: string;
};

/** Jambo: プレゼント送付ポイント消費リクエスト */
export type PayPresentMenuPointJamboRequest = {
  api: typeof JAMBO_API_ROUTE.PAY_SECOND_VIDEO_CHAT_MENU_POINT;
  partner_id: string;
  token: string;
  text: string;
  consume_point: number;
  type: string;
  call_type: 'live' | 'side_watch' | 'video';
};

/** Jambo: プレゼント送付ポイント消費レスポンス（serverHttpClientがcamelCase変換後） */
export type PayPresentMenuPointJamboResponse = {
  code: number;
  data: {
    myPoint: { point: number };
    broadcasterPoint: { point: number };
  };
  message?: string;
};

// ──────────────────────────────────────────
// リクエスト作成関数
// ──────────────────────────────────────────

export const createGetPresentMenuListJamboRequest = (
  token: string,
  partnerId: string,
): GetPresentMenuListJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_VIDEO_CHAT_MENU_LIST,
  token,
  partner_id: partnerId,
});

export const createPayPresentMenuPointJamboRequest = (
  token: string,
  partnerId: string,
  text: string,
  consumePoint: number,
  type: string,
  callType: 'live' | 'side_watch' | 'video',
): PayPresentMenuPointJamboRequest => ({
  api: JAMBO_API_ROUTE.PAY_SECOND_VIDEO_CHAT_MENU_POINT,
  partner_id: partnerId,
  token,
  text,
  consume_point: consumePoint,
  type,
  call_type: callType,
});

// ──────────────────────────────────────────
// レスポンス変換関数
// ──────────────────────────────────────────

export const transformPresentMenuItem = (
  item: JamboPresentMenuItem,
): PresentMenuItem => ({
  consumePoint: item.consumePoint,
  index: item.index,
  type: item.type,
  text: item.text,
});
