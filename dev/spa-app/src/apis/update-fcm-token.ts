import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type UpdateFcmTokenRequest = JamboRequest & {
  readonly api: 'upd_noti_token';
  readonly token: string;
  readonly notify_token: string;
  readonly SENDER_ACCOUNT: string;
  readonly device_type: 2;
};

export type UpdateFcmTokenResponse = JamboResponseData & {};

export const updateFcmTokenRequest = (
  token: string,
  notifyToken: string,
): UpdateFcmTokenRequest => ({
  api: 'upd_noti_token',
  notify_token: notifyToken,
  device_type: 2,
  SENDER_ACCOUNT: 'UTAGE_WEB',
  token,
});
