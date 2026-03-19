import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type UtageWebDailyBonusRequest = JamboRequest & {
  api: 'utage_web_daily_bonus';
  token: string;
};

export type UtageWebDailyBonusResponseData = JamboResponseData & {
  add_point?: number;
  double_daily_bonus_days?: number;
  double_bonus_limit_date?: string;
};

export const utageWebDailyBonusRequest = (
  token: string,
): UtageWebDailyBonusRequest => ({
  api: 'utage_web_daily_bonus',
  token,
});
