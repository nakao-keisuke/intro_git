import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';

// ──────────────────────────────────────────
// 型定義: Client ⇔ Route Handler
// ──────────────────────────────────────────

/** Lovenseメニュー一覧取得リクエスト */
export type GetLovenseMenuListRequest = {
  partner_id: string;
  call_type: 'live' | 'side_watch' | 'video';
};

/** Lovenseメニュー項目 */
export type LovenseMenuItem = {
  duration: number;
  consumePoint: number;
  index: number;
  type: string;
  displayName: string;
  ticketCount?: number;
};

/** Lovenseメニュー一覧取得レスポンス */
export type GetLovenseMenuListResponse = {
  menuList: LovenseMenuItem[];
  canGetTicket?: boolean;
  isOnCampaign?: boolean;
};

/** Lovenseメニューポイント消費リクエスト */
export type PayLovenseMenuPointRequest = {
  partner_id: string;
  type: string;
  consume_point: number;
  duration: number;
  call_type: 'live' | 'side_watch' | 'video';
  is_free_action?: boolean;
};

/** Lovenseメニューポイント消費レスポンス */
export type PayLovenseMenuPointResponse = {
  myPoint: number;
  partnerPoint: number;
};

/** Lovenseコントロールコマンド送信リクエスト */
export type SendLovenseControlCommandRequest = {
  partner_id: string;
  lovense_intensity: number;
  lovense_time_sec?: number;
};

/** Lovenseコントロールコマンド送信レスポンス */
// biome-ignore lint/complexity/noBannedTypes: 成功時はデータなし
export type SendLovenseControlCommandResponse = {};

/** 未完了Lovenseログ取得リクエスト */
export type GetUncompletedLovenseLogRequest = {
  female_id: string;
};

/** 未完了Lovenseログ項目 */
export type UncompletedLovenseLogItem = {
  maleName: string;
  duration: number;
  startTime: number;
  endTime: number;
  type: string;
  justStarted: boolean;
};

/** 未完了Lovenseログ取得レスポンス */
export type GetUncompletedLovenseLogResponse = {
  logLovenseMenuList: UncompletedLovenseLogItem[];
};

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Jambo
// ──────────────────────────────────────────

/** Jambo: Lovenseメニュー一覧取得リクエスト */
export type GetLovenseMenuListJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_LOVENSE_MENU_LIST;
  token: string;
  partner_id: string;
  call_type: 'live' | 'side_watch' | 'video';
};

/** Jambo: Lovenseメニュー項目（serverHttpClientがcamelCase変換後） */
type JamboLovenseMenuItem = {
  duration: number;
  consumePoint: number;
  index: number;
  type: string;
  displayName: string;
  ticketCount?: number;
};

/** Jambo: Lovenseメニュー一覧取得レスポンス（serverHttpClientがcamelCase変換後） */
export type GetLovenseMenuListJamboResponse = {
  code: number;
  data: {
    lovenseMenuList: JamboLovenseMenuItem[];
    canGetTicket?: boolean;
    isOnCampaign?: boolean;
  };
  message?: string;
};

/** Jambo: Lovenseメニューポイント消費リクエスト */
export type PayLovenseMenuPointJamboRequest = {
  api: typeof JAMBO_API_ROUTE.PAY_SECOND_LOVENSE_MENU_POINT;
  token: string;
  partner_id: string;
  type: string;
  consume_point: number;
  duration: number;
  call_type: 'live' | 'side_watch' | 'video';
  is_free_action?: boolean;
};

/** Jambo: Lovenseメニューポイント消費レスポンス（serverHttpClientがcamelCase変換後） */
export type PayLovenseMenuPointJamboResponse = {
  code: number;
  data: {
    myPoint: {
      point: number;
      untradablePoint: number;
      tradablePoint: number;
    };
    partnerPoint?: {
      point: number;
      untradablePoint: number;
      tradablePoint: number;
    };
    broadcasterPoint?: {
      point: number;
      untradablePoint: number;
      tradablePoint: number;
    };
  };
  message?: string;
};

/** Jambo: Lovenseコントロールコマンド送信リクエスト */
export type SendLovenseControlCommandJamboRequest = {
  api: typeof JAMBO_API_ROUTE.SEND_LOVENSE_CONTROL_COMMAND;
  token: string;
  partner_id: string;
  lovense_action: 'Vibrate';
  lovense_intensity: number;
  lovense_time_sec?: number;
};

/** Jambo: Lovenseコントロールコマンド送信レスポンス（serverHttpClientがcamelCase変換後） */
export type SendLovenseControlCommandJamboResponse = {
  code: number;
  message?: string;
};

/** Jambo: 未完了Lovenseログ取得リクエスト */
export type GetUncompletedLovenseLogJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_UNCOMPLETED_LOVENSE_LOG_BY_ROOM;
  token: string;
  female_id: string;
};

/** Jambo: 未完了Lovenseログ項目（serverHttpClientがcamelCase変換後） */
type JamboUncompletedLovenseLogItem = {
  maleName: string;
  duration: number;
  startTime: number;
  endTime: number;
  type: string;
  justStarted: boolean;
};

/** Jambo: 未完了Lovenseログ取得レスポンス（serverHttpClientがcamelCase変換後） */
export type GetUncompletedLovenseLogJamboResponse = {
  code: number;
  data: {
    logLovenseMenuList: JamboUncompletedLovenseLogItem[];
  };
  message?: string;
};

// ──────────────────────────────────────────
// リクエスト作成関数
// ──────────────────────────────────────────

export const createGetLovenseMenuListJamboRequest = (
  token: string,
  partnerId: string,
  callType: 'live' | 'side_watch' | 'video',
): GetLovenseMenuListJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_LOVENSE_MENU_LIST,
  token,
  partner_id: partnerId,
  call_type: callType,
});

export const createPayLovenseMenuPointJamboRequest = (
  token: string,
  partnerId: string,
  type: string,
  consumePoint: number,
  duration: number,
  callType: 'live' | 'side_watch' | 'video',
  isFreeAction?: boolean,
): PayLovenseMenuPointJamboRequest => ({
  api: JAMBO_API_ROUTE.PAY_SECOND_LOVENSE_MENU_POINT,
  token,
  partner_id: partnerId,
  type,
  consume_point: consumePoint,
  duration,
  call_type: callType,
  ...(isFreeAction !== undefined && { is_free_action: isFreeAction }),
});

export const createSendLovenseControlCommandJamboRequest = (
  token: string,
  partnerId: string,
  lovenseIntensity: number,
  lovenseTimeSec?: number,
): SendLovenseControlCommandJamboRequest => ({
  api: JAMBO_API_ROUTE.SEND_LOVENSE_CONTROL_COMMAND,
  token,
  partner_id: partnerId,
  lovense_action: 'Vibrate',
  lovense_intensity: lovenseIntensity,
  ...(lovenseTimeSec !== undefined && { lovense_time_sec: lovenseTimeSec }),
});

export const createGetUncompletedLovenseLogJamboRequest = (
  token: string,
  femaleId: string,
): GetUncompletedLovenseLogJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_UNCOMPLETED_LOVENSE_LOG_BY_ROOM,
  token,
  female_id: femaleId,
});

// ──────────────────────────────────────────
// レスポンス変換関数
// ──────────────────────────────────────────

export const transformLovenseMenuItem = (
  item: JamboLovenseMenuItem,
): LovenseMenuItem => ({
  duration: item.duration,
  consumePoint: item.consumePoint,
  index: item.index,
  type: item.type,
  displayName: item.displayName,
  ...(item.ticketCount !== undefined && { ticketCount: item.ticketCount }),
});

export const transformUncompletedLovenseLogItem = (
  item: JamboUncompletedLovenseLogItem,
): UncompletedLovenseLogItem => ({
  maleName: item.maleName,
  duration: item.duration,
  startTime: item.startTime,
  endTime: item.endTime,
  type: item.type,
  justStarted: item.justStarted,
});
