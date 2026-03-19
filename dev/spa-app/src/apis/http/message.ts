import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';
import type { ChatInfo } from '@/types/ChatInfo';

/**
 * client ⇔ Route Handler のレスポンス
 * メッセージ送信共通
 * - 成功: { success: true }
 * - 失敗: ErrorData（NextApi.ts 準拠）+ notEnoughPoint
 */
export type SendMessageRouteResponse = ApiRouteResponse<undefined> & {
  readonly notEnoughPoint?: boolean;
};

/**
 * Route Handler ⇔ jambo-server リクエスト定義（snake_case）
 */

// テキストメッセージ送信
export type SendTextMessageRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.SEND_TEXT_MESSAGE;
  readonly user_id: string;
  readonly rcv_id: string;
  readonly content: string;
  readonly is_free: boolean;
  readonly token: string;
  readonly web_custom_consume_point?: number;
};

// 画像送信
export type SendImageRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.SEND_IMAGE;
  readonly userId: string;
  readonly partnerId: string;
  readonly fileId: string;
};

// 動画送信
export type SendVideoRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.SEND_VIDEO;
  readonly userId: string;
  readonly partnerId: string;
  readonly fileId: string;
  readonly duration: number;
  readonly token: string;
};

// ユーザー情報取得（新規パートナーチェック用）
export type GetUserInfoRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_USER_INFO_FOR_WEB;
  readonly req_user_id: string;
  readonly user_id?: string;
};

// ポイント消費ログ
export type LogConsumedPointRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.LOG_CONSUMED_POINT;
  readonly token: string;
  readonly point: number;
};

/**
 * リクエスト作成関数
 */

// テキストメッセージ送信（通常）
export const createSendTextMessageRequest = (
  userId: string,
  partnerId: string,
  content: string,
  isFree: boolean,
  token: string,
): SendTextMessageRequest => ({
  api: JAMBO_API_ROUTE.SEND_TEXT_MESSAGE,
  user_id: userId,
  rcv_id: partnerId,
  content,
  is_free: isFree,
  token,
});

// テキストメッセージ送信（キャンペーン）
export const createSendTextMessageCampaignRequest = (
  userId: string,
  partnerId: string,
  content: string,
  isFree: boolean,
  token: string,
  customConsumePoint: number,
): SendTextMessageRequest => ({
  api: JAMBO_API_ROUTE.SEND_TEXT_MESSAGE,
  user_id: userId,
  rcv_id: partnerId,
  content,
  is_free: isFree,
  token,
  web_custom_consume_point: customConsumePoint,
});

// 画像送信
export const createSendImageRequest = (
  userId: string,
  partnerId: string,
  fileId: string,
): SendImageRequest => ({
  api: JAMBO_API_ROUTE.SEND_IMAGE,
  userId,
  partnerId,
  fileId,
});

// 動画送信
export const createSendVideoRequest = (
  userId: string,
  partnerId: string,
  fileId: string,
  duration: number,
  token: string,
): SendVideoRequest => ({
  api: JAMBO_API_ROUTE.SEND_VIDEO,
  userId,
  partnerId,
  fileId,
  duration,
  token,
});

// ユーザー情報取得
export const createGetUserInfoRequest = (
  partnerId: string,
): GetUserInfoRequest => ({
  api: JAMBO_API_ROUTE.GET_USER_INFO_FOR_WEB,
  req_user_id: partnerId,
});

// ポイント消費ログ
export const createLogConsumedPointRequest = (
  token: string,
  point: number,
): LogConsumedPointRequest => ({
  api: JAMBO_API_ROUTE.LOG_CONSUMED_POINT,
  token,
  point,
});

// スタンプ送信（通常）
export const createSendStickerRequest = (
  userId: string,
  partnerId: string,
  content: string,
  isFree: boolean,
  token: string,
  isGift: boolean,
): SendStickerRequest => ({
  api: JAMBO_API_ROUTE.SEND_TEXT_MESSAGE,
  user_id: userId,
  rcv_id: partnerId,
  content,
  is_free: isFree,
  token,
  is_sticker: true,
  is_gift: isGift,
});

// スタンプ送信（キャンペーン）
export const createSendStickerCampaignRequest = (
  userId: string,
  partnerId: string,
  content: string,
  isFree: boolean,
  token: string,
  customConsumePoint: number,
  isGift: boolean,
): SendStickerRequest => ({
  api: JAMBO_API_ROUTE.SEND_TEXT_MESSAGE,
  user_id: userId,
  rcv_id: partnerId,
  content,
  is_free: isFree,
  token,
  web_custom_consume_point: customConsumePoint,
  is_sticker: true,
  is_gift: isGift,
});

// 不在着信メッセージ送信
export const createSendAbsenceCallMessageRequest = (
  userId: string,
  partnerId: string,
  token: string,
): SendAbsenceCallMessageRequest => ({
  api: JAMBO_API_ROUTE.SEND_ABSENCE_CALL_MESSAGE,
  user_id: userId,
  req_user_id: partnerId,
  content: 'キャンセル',
  token,
});

/**
 * jambo-server レスポンス定義
 */

// メッセージ送信レスポンス（成功時はデータなし）
export type SendMessageUpstreamResponse = APIResponse<null>;

// ユーザー情報取得レスポンス
export type GetUserInfoUpstreamResponse = APIResponse<{
  readonly userId: string;
  readonly userName: string;
  readonly regDate?: string;
  readonly point: number;
  readonly region: number;
  readonly age: number;
  readonly avaId: string;
  readonly bookmark: boolean;
  readonly isNew: boolean;
  // その他のフィールドは必要に応じて追加
}>;

// ポイント消費ログレスポンス（成功時はデータなし）
export type LogConsumedPointUpstreamResponse = APIResponse<null>;

// スタンプ送信（send_message_from_webと同じAPIを使用、追加フィールドあり）
export type SendStickerRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.SEND_TEXT_MESSAGE;
  readonly user_id: string;
  readonly rcv_id: string;
  readonly content: string;
  readonly is_free: boolean;
  readonly token: string;
  readonly web_custom_consume_point?: number;
  readonly is_sticker: boolean;
  readonly is_gift: boolean;
};

// 不在着信メッセージ送信
export type SendAbsenceCallMessageRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.SEND_ABSENCE_CALL_MESSAGE;
  readonly user_id: string;
  readonly req_user_id: string;
  readonly content: string;
  readonly token: string;
};

/**
 * 過去メッセージ取得
 * client ⇔ Route Handler ⇔ jambo-server
 */

// client → Route Handler リクエスト
export type GetMoreTextMessagesRequest = {
  readonly partnerId: string;
  readonly timeStamp: string;
};

// client ← Route Handler レスポンス
export type GetMoreTextMessagesResponse = ApiRouteResponse<ChatInfo[]>;
