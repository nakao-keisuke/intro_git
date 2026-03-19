import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type AddPwaInstallBonusRequest = JamboRequest & {
  readonly api: 'pwa_register_bonus';
  readonly token: string;
  readonly application_id: string;
};

export type AddPwaInstallBonusResponseData = JamboResponseData & {
  readonly add_point: number;
};

export const addPwaInstallBonusRequest = (
  token: string,
): AddPwaInstallBonusRequest => ({
  api: 'pwa_register_bonus',
  token,
  application_id: '15',
});
