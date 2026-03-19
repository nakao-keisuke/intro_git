import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';

export type MissionStatus = 'in_progress' | 'complete' | 'point_received';

export type OnboardingMission = {
  missionId: number;
  title: string;
  missionPoint: number;
  status: MissionStatus;
  progressCount?: number;
  needCount?: number;
};

export type OnboardingMissionProgressResponse = {
  completionRate: number;
  earnedPoints: number;
  userId: string;
  completedMissions: number;
  missions: OnboardingMission[];
  totalPossiblePoints: number;
  totalMissions: number;
};

export type GetOnboardingMissionProgressRequest = {
  isPwa?: boolean;
};

export type GetOnboardingMissionProgressJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_UTAGE_ONBOARDING_MISSION_PROGRESS;
  token: string;
  is_pwa: boolean;
};

export type UpdateOnboardingMissionProgressRequest = {
  missionId: number;
  isComplete: boolean;
};

export type UpdateOnboardingMissionProgressJamboRequest = {
  api: typeof JAMBO_API_ROUTE.UPDATE_UTAGE_ONBOARDING_MISSION_PROGRESS;
  token: string;
  mission_id: number;
  is_complete: boolean;
  line_id?: string;
};

export type UpdateOnboardingMissionProgressResponse = {
  success?: boolean;
  message?: string;
};

export type GetOnboardingMissionBonusRequest = {
  missionId: number;
};

export type GetOnboardingMissionBonusJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_UTAGE_ONBOARDING_MISSION_POINT;
  token: string;
  mission_id: number;
};

export type GetOnboardingMissionBonusResponse = {
  points?: number;
  missionId?: number;
};

export type CheckMissionCompletedResponse = {
  isAllMissionCompleted: boolean;
};

type CheckRegisterEmailStatusJamboRequest = {
  api: typeof JAMBO_API_ROUTE.CHECK_REGISTER_EMAIL_STATUS_FOR_UTAGE_WEB;
  token: string;
};

type HasReceivedPwaRegisterBonusJamboRequest = {
  api: typeof JAMBO_API_ROUTE.HAS_RECEIVED_PWA_REGISTER_BONUS;
  token: string;
};

type GetPhoneVerificationStatusJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_PHONE_VERIFICATION_STATUS;
  token: string;
};

export const createGetOnboardingMissionProgressJamboRequest = (
  token: string,
  request: GetOnboardingMissionProgressRequest,
): GetOnboardingMissionProgressJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_UTAGE_ONBOARDING_MISSION_PROGRESS,
  token,
  is_pwa: request.isPwa ?? false,
});

export const createUpdateOnboardingMissionProgressJamboRequest = (
  token: string,
  request: UpdateOnboardingMissionProgressRequest,
  lineId?: string | null,
): UpdateOnboardingMissionProgressJamboRequest => ({
  api: JAMBO_API_ROUTE.UPDATE_UTAGE_ONBOARDING_MISSION_PROGRESS,
  token,
  mission_id: request.missionId,
  is_complete: request.isComplete,
  ...(lineId ? { line_id: lineId } : {}),
});

export const createGetOnboardingMissionBonusJamboRequest = (
  token: string,
  request: GetOnboardingMissionBonusRequest,
): GetOnboardingMissionBonusJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_UTAGE_ONBOARDING_MISSION_POINT,
  token,
  mission_id: request.missionId,
});

export const createCheckRegisterEmailStatusJamboRequest = (
  token: string,
): CheckRegisterEmailStatusJamboRequest => ({
  api: JAMBO_API_ROUTE.CHECK_REGISTER_EMAIL_STATUS_FOR_UTAGE_WEB,
  token,
});

export const createHasReceivedPwaRegisterBonusJamboRequest = (
  token: string,
): HasReceivedPwaRegisterBonusJamboRequest => ({
  api: JAMBO_API_ROUTE.HAS_RECEIVED_PWA_REGISTER_BONUS,
  token,
});

export const createGetPhoneVerificationStatusJamboRequest = (
  token: string,
): GetPhoneVerificationStatusJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_PHONE_VERIFICATION_STATUS,
  token,
});
