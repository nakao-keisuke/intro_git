import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type UpdateNotificationSettingsRequest = JamboRequest & {
  readonly api: 'noti_set';
  readonly token: string;
  readonly chat: number;
  readonly noti_buzz: number;
  readonly andg_alt: number;
  readonly noti_chk_out: number;
  readonly noti_like: number;
  readonly noti_bookmarked_user: number;
};

export type UpdateNotificationSettingsResponse = JamboResponseData & {};

export const updateNotificationSettingsRequest = (
  token: string,
): UpdateNotificationSettingsRequest => ({
  api: 'noti_set',
  chat: 0, // チャット通知も一旦すべて0(有効)にする
  // chat以外は使用してないので0:offの固定値を設定
  noti_buzz: 0,
  andg_alt: 0,
  noti_chk_out: 0,
  noti_like: 0,
  noti_bookmarked_user: 0,
  token,
});
