import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type GetNotificationSettingsRequest = JamboRequest & {
  readonly api: 'get_noti_set';
  readonly token: string;
};

export enum ChatNotificationSetting {
  ON = 0,
  OFF = -1,
  FAVORITES_ONLY = 1,
}

export type GetNotificationSettingsResponseData = JamboResponseData & {
  setting: {
    readonly chat: ChatNotificationSetting;
  };
};

export const getNotificationSettingsRequest = (
  token: string,
): GetNotificationSettingsRequest => ({
  api: 'get_noti_set',
  token,
});
