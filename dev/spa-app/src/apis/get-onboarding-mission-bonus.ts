import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type GetUtageOnboardingMissionPointRequest = JamboRequest & {
  api: 'get_utage_onboarding_mission_point';
  token: string;
  mission_id: number;
};

export type GetUtageOnboardingMissionPointResponseData = JamboResponseData & {};

export const getUtageOnboardingMissionPointRequest = (
  token: string,
  mission_id: number,
): GetUtageOnboardingMissionPointRequest => ({
  api: 'get_utage_onboarding_mission_point',
  token,
  mission_id,
});
