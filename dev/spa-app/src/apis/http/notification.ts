import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIResponse } from '@/libs/http/type';

// ──────────────────────────────────────────
// ポイント不足通知 (Point Shortage Notification)
// ──────────────────────────────────────────

/**
 * クライアント → Route Handler
 * ポイント不足通知リクエスト（ボディなし）
 */
export type NotifyPointShortageRequest = Record<string, never>;

/**
 * Route Handler → クライアント
 * ポイント不足通知レスポンス（データなし）
 */
// biome-ignore lint/complexity/noBannedTypes: Empty response object is intentional
export type NotifyPointShortageResponse = {};

/**
 * Route Handler → Jambo API
 * ポイント不足通知 Jambo リクエスト
 */
export type NotifyPointShortageJamboRequest = {
  api: typeof JAMBO_API_ROUTE.UTAGE_NOT_ENOUGH_POINT;
  token: string;
};

/**
 * Jambo API からのレスポンス
 */
export type NotifyPointShortageJamboResponse = {
  code: number;
  message?: string;
};

/**
 * ポイント不足通知 Jambo リクエスト作成関数
 */
export const createNotifyPointShortageJamboRequest = (
  token: string,
): NotifyPointShortageJamboRequest => ({
  api: JAMBO_API_ROUTE.UTAGE_NOT_ENOUGH_POINT,
  token,
});

// ──────────────────────────────────────────
// 通知一覧取得 (Get Notifications)
// ──────────────────────────────────────────

export type GetNotificationsRequestBody = {
  timeStamp?: string;
  notiType?: string;
};

export type ListNotificationJamboRequest = {
  api: typeof JAMBO_API_ROUTE.LIST_NOTIFICATION;
  token: string;
  take: number;
  time_stamp?: string;
  noti_type?: string;
  region?: null;
  ip?: string;
};

export type ListNotificationJamboResponseData = {
  avatarId: string;
  abt: string;
  timeOutUser: boolean;
  notiUserName: string;
  notiUserId: string;
  notiType: number;
  dist: number;
  offlineCall: boolean;
  time: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  age: number;
  region: number;
};

export type ListNotificationUpstreamResponse = APIResponse<
  ListNotificationJamboResponseData[]
>;

export type GetUserInfoForWebJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_USER_INFO_FOR_WEB;
  req_user_id: string;
  ip?: string;
};

export type GetUserInfoForWebJamboResponseData = {
  userId: string;
  age?: number;
  region?: number;
  bustSize?: string;
  hLevel?: string;
  hasLovense?: boolean;
};

export type GetUserInfoForWebUpstreamResponse =
  APIResponse<GetUserInfoForWebJamboResponseData>;

export const createListNotificationRequest = (
  token: string,
  body: GetNotificationsRequestBody,
  ip?: string,
): ListNotificationJamboRequest => {
  // 共通のベースリクエスト
  const baseRequest: ListNotificationJamboRequest = {
    api: JAMBO_API_ROUTE.LIST_NOTIFICATION,
    token,
    take: 100,
    ...(ip && { ip }),
  };

  // timeStamp指定時: 指定時刻以降の通知を取得（ページネーション用）
  if (body.timeStamp) {
    return {
      ...baseRequest,
      time_stamp: body.timeStamp,
    };
  }

  // notiType指定時: 通知タイプでフィルタリング（'all'の場合はフィルタなし）
  if (body.notiType) {
    return {
      ...baseRequest,
      ...(body.notiType !== 'all' && { noti_type: body.notiType }),
    };
  }

  // デフォルト: 初回取得時は region: null を指定して全地域の通知を取得
  // Jambo APIの仕様でregion未指定時はユーザーの地域でフィルタされるため、nullで明示的に全地域を指定
  return {
    ...baseRequest,
    region: null,
  };
};

export const createGetUserInfoForWebRequest = (
  partnerId: string,
  ip?: string,
): GetUserInfoForWebJamboRequest => {
  const request: GetUserInfoForWebJamboRequest = {
    api: JAMBO_API_ROUTE.GET_USER_INFO_FOR_WEB,
    req_user_id: partnerId,
  };
  if (ip) request.ip = ip;
  return request;
};

// ──────────────────────────────────────────
// FCMトークン更新 (Update FCM Token)
// ──────────────────────────────────────────

export type UpdateFcmTokenRequestBody = {
  fcmToken?: string;
};

export type UpdateFcmTokenJamboRequest = {
  api: typeof JAMBO_API_ROUTE.UPDATE_FCM_TOKEN;
  token: string;
  notify_token: string;
  SENDER_ACCOUNT: 'UTAGE_WEB';
  device_type: 2;
  ip?: string;
};

export type UpdateFcmTokenUpstreamResponse = APIResponse<null>;

export const createUpdateFcmTokenRequest = (
  token: string,
  notifyToken: string,
  ip?: string,
): UpdateFcmTokenJamboRequest => {
  const request: UpdateFcmTokenJamboRequest = {
    api: JAMBO_API_ROUTE.UPDATE_FCM_TOKEN,
    notify_token: notifyToken,
    device_type: 2,
    SENDER_ACCOUNT: 'UTAGE_WEB',
    token,
  };
  if (ip) request.ip = ip;
  return request;
};
