import type { OnboardingProgressData } from '@/services/onboarding/type';
import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

//
// 1) リクエスト型：Jambo に投げるときに渡す JSON 形式
//
export type OnboardingMissionRequest = JamboRequest & {
  api: 'get_utage_onboarding_mission_progress';
  token: string;
  is_pwa: boolean;
};

export type UpdateOnboardingMissionRequest = JamboRequest & {
  api: 'update_utage_onboarding_mission_progress';
  token: string;
  mission_id: number;
  is_complete: boolean;
  line_id?: string;
};

//
// 2) ミッション項目ひとつ分の型
//
export type MissionItem = {
  mission_id: number;
  title: string;
  mission_point: number;
  status: 'in_progress' | 'complete' | 'point_received';
  progress_count?: number;
  need_count?: number;
};

// APIレスポンスがcamelCase/snake_case両方に対応するための型
export type RawMissionItem = MissionItem & {
  missionId?: number;
  missionPoint?: number;
  progressCount?: number;
  needCount?: number;
};

// APIレスポンスをsnake_case形式のMissionItemに正規化
export const normalizeMissionToSnakeCase = (
  mission: RawMissionItem,
): MissionItem => {
  const result: MissionItem = {
    mission_id: mission.missionId ?? mission.mission_id,
    title: mission.title,
    mission_point: mission.missionPoint ?? mission.mission_point,
    status: mission.status,
  };
  const progressCount = mission.progressCount ?? mission.progress_count;
  const needCount = mission.needCount ?? mission.need_count;
  if (progressCount !== undefined) result.progress_count = progressCount;
  if (needCount !== undefined) result.need_count = needCount;
  return result;
};

//
// 3) Jambo から返ってくる「data」部分の型
//
export type OnboardingMissionResponseData = JamboResponseData & {
  completion_rate: number;
  earned_points: number;
  user_id: string;
  completed_missions: number;
  missions: MissionItem[];
  total_possible_points: number;
  total_missions: number;
};

export type UpdateOnboardingMissionResponseData = JamboResponseData & {
  success: boolean;
  message?: string;
};

//
// 4) リクエストを組み立てるユーティリティ関数
//
export const onboardingMissionRequest = (
  token: string,
  isPwa: boolean,
): OnboardingMissionRequest => ({
  api: 'get_utage_onboarding_mission_progress',
  token: token,
  is_pwa: isPwa,
});

//
// 5) ミッション完了判定のユーティリティ関数
//
// 全てのミッションのポイントを受け取ったかどうかをチェック
// - OnboardingMissionResponseData: Jambo APIからのレスポンス（スネークケース）
// - OnboardingProgressData: アプリケーション内部で使用する型（キャメルケース）
export function isAllMissionCompleted(
  data: OnboardingMissionResponseData,
): boolean;
export function isAllMissionCompleted(data: OnboardingProgressData): boolean;
export function isAllMissionCompleted(
  data: OnboardingMissionResponseData | OnboardingProgressData,
): boolean {
  // キャメルケース（OnboardingProgressData）の場合
  if ('completionRate' in data) {
    return (
      data.completionRate === 100 &&
      data.completedMissions === data.totalMissions &&
      data.missions.every((mission) => mission.status === 'point_received')
    );
  }

  // スネークケース（OnboardingMissionResponseData）の場合
  return (
    data.completion_rate === 100 &&
    data.completed_missions === data.total_missions &&
    data.missions.every((mission) => mission.status === 'point_received')
  );
}
