export type MissionStatus = 'in_progress' | 'complete' | 'point_received';

// キャメルケース版の型定義
export type Mission = {
  missionId: number;
  title: string;
  missionPoint: number;
  status: MissionStatus;
  progressCount?: number;
  needCount?: number;
};

export type OnboardingProgressData = {
  completionRate: number;
  earnedPoints: number;
  userId: string;
  completedMissions: number;
  missions: Mission[];
  totalPossiblePoints: number;
  totalMissions: number;
};

// APIレスポンス用のスネークケース版型定義（内部使用）
export type MissionApiResponse = {
  mission_id: number;
  title: string;
  mission_point: number;
  status: MissionStatus;
  progress_count?: number;
  need_count?: number;
};

export type OnboardingProgressApiResponse = {
  completion_rate: number;
  earned_points: number;
  user_id: string;
  completed_missions: number;
  missions: MissionApiResponse[];
  total_possible_points: number;
  total_missions: number;
};

export type OnboardingMissionRequest = {
  api: 'get_utage_onboarding_mission_progress';
  token: string;
  is_pwa: boolean;
};

export type OnboardingMissionResponse = {
  type: 'success' | 'error';
  message?: string;
  completion_rate?: number;
  earned_points?: number;
  user_id?: string;
  completed_missions?: number;
  missions?: MissionApiResponse[];
  total_possible_points?: number;
  total_missions?: number;
};

export type UpdateMissionProgressRequest = {
  api: 'update_utage_onboarding_mission_progress';
  token: string;
  mission_id: number;
  is_complete: boolean;
};

export type UpdateMissionProgressResponse = {
  type: 'success' | 'error';
  message?: string;
};

export type GetMissionPointRequest = {
  api: 'get_onboarding_mission_bonus';
  token: string;
  mission_id: number;
};

export type GetMissionPointResponse = {
  type: 'success' | 'error';
  message?: string;
  points?: number;
};
