import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type AddNotificationBonusRequest = JamboRequest & {
  readonly api: 'notification_permission_bonus';
  readonly token: string;
  readonly application_id: string;
};

export type AddNotificationBonusResponseData = JamboResponseData & {
  readonly add_point: number;
};

export const addNotificationBonusRequest = (
  token: string,
): AddNotificationBonusRequest => ({
  api: 'notification_permission_bonus',
  token,
  application_id: '15',
});
