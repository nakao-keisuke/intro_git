import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type receiveMenuReleasePointBackBonus = JamboRequest & {
  readonly api: 'add_present_menu_bonus_point';
  readonly token: string;
};

export interface ReceiveMenuReleasePointBackBonusData
  extends JamboResponseData {
  readonly data: { readonly addpoint: number };
}

export const receiveMenuReleasePointBackBonusRequest = (
  token: string,
): receiveMenuReleasePointBackBonus => ({
  api: 'add_present_menu_bonus_point',
  token: token,
});
