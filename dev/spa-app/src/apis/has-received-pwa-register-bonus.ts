import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type HasReceivedPwaRegisterBonusRequest = JamboRequest & {
  readonly api: 'has_received_pwa_register_bonus';
  readonly token: string;
};

export type HasReceivedPwaRegisterBonusResponseData = JamboResponseData & {
  readonly result: boolean;
};

export const hasReceivedPwaRegisterBonusRequest = (
  token: string,
): HasReceivedPwaRegisterBonusRequest => ({
  api: 'has_received_pwa_register_bonus',
  token,
});
