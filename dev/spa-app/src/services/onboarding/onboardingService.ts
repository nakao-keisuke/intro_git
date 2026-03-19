import { getServerSession } from 'next-auth';
import {
  HTTP_GET_ONBOARDING_MISSION_BONUS,
  HTTP_GET_UTAGE_ONBOARDING_MISSION_PROGRESS,
  HTTP_UPDATE_ONBOARDING_MISSION_PROGRESS,
} from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { Context } from '@/libs/http/type';
import { isPWA } from '@/libs/isPWA';
import type {
  GetMissionPointRequest,
  GetMissionPointResponse,
  Mission,
  MissionApiResponse,
  OnboardingMissionRequest,
  OnboardingMissionResponse,
  OnboardingProgressData,
  UpdateMissionProgressRequest,
  UpdateMissionProgressResponse,
} from './type';

// APIレスポンスがキャメルケースとスネークケース両方に対応
const convertMissionToCamelCase = (
  mission: MissionApiResponse | Mission,
): Mission => {
  // APIがキャメルケースで返す場合
  if ('missionId' in mission) {
    const result: Mission = {
      missionId: mission.missionId,
      title: mission.title,
      missionPoint: mission.missionPoint,
      status: mission.status,
    };
    if (mission.progressCount !== undefined)
      result.progressCount = mission.progressCount;
    if (mission.needCount !== undefined) result.needCount = mission.needCount;
    return result;
  }

  // スネークケースの場合
  const result: Mission = {
    missionId: mission.mission_id,
    title: mission.title,
    missionPoint: mission.mission_point,
    status: mission.status,
  };
  if (mission.progress_count !== undefined)
    result.progressCount = mission.progress_count;
  if (mission.need_count !== undefined) result.needCount = mission.need_count;
  return result;
};

// APIレスポンスの変換
type ApiResponseData = OnboardingMissionResponse & {
  // 追加のプロパティをサポート
  completionRate?: number;
  earnedPoints?: number;
  userId?: string;
  completedMissions?: number;
  totalPossiblePoints?: number;
  totalMissions?: number;
};

const convertProgressDataToCamelCase = (
  data: ApiResponseData,
): OnboardingProgressData => {
  // APIがキャメルケースで返す場合
  if ('completionRate' in data) {
    return {
      completionRate: data.completionRate || 0,
      earnedPoints: data.earnedPoints || 0,
      userId: data.userId || '',
      completedMissions: data.completedMissions || 0,
      missions: (data.missions || []).map(convertMissionToCamelCase),
      totalPossiblePoints: data.totalPossiblePoints || 0,
      totalMissions: data.totalMissions || 0,
    };
  }

  // スネークケースの場合
  return {
    completionRate: data.completion_rate || 0,
    earnedPoints: data.earned_points || 0,
    userId: data.user_id || '',
    completedMissions: data.completed_missions || 0,
    missions: (data.missions || []).map(convertMissionToCamelCase),
    totalPossiblePoints: data.total_possible_points || 0,
    totalMissions: data.total_missions || 0,
  };
};

export interface OnboardingService {
  getOnboardingMissions(): Promise<OnboardingProgressData>;
  updateMissionProgress(
    missionId: number,
    isComplete: boolean,
  ): Promise<UpdateMissionProgressResponse>;
  getMissionPoint(missionId: number): Promise<GetMissionPointResponse>;
}

export class ServerOnboardingService implements OnboardingService {
  constructor(private readonly client: HttpClient) {}

  async getOnboardingMissions(): Promise<OnboardingProgressData> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);

    // 非認証ユーザーの場合は空のデータを返す
    if (!session?.user?.token) {
      return {
        completionRate: 0,
        earnedPoints: 0,
        userId: '',
        completedMissions: 0,
        missions: [],
        totalPossiblePoints: 0,
        totalMissions: 0,
      };
    }

    const request: OnboardingMissionRequest = {
      api: 'get_utage_onboarding_mission_progress',
      token: session.user.token,
      is_pwa: false, // Server側では常にfalse
    };

    const response = await this.client.post<
      OnboardingMissionResponse & {
        code?: number;
        data?: OnboardingMissionResponse;
      }
    >(import.meta.env.API_URL as string, request);

    // APIレスポンスの形式を確認
    if (!response || (response.code !== undefined && response.code !== 0)) {
      throw new Error('Failed to fetch onboarding missions');
    }

    // codeプロパティがある場合はdata部分を、ない場合は全体を使用
    const data = response.code !== undefined ? response.data : response;

    if (!data) {
      throw new Error('Failed to fetch onboarding missions: no data returned');
    }

    return convertProgressDataToCamelCase(data as ApiResponseData);
  }

  async updateMissionProgress(
    missionId: number,
    isComplete: boolean,
  ): Promise<UpdateMissionProgressResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    if (!session?.user?.token) {
      throw new Error('Unauthorized');
    }

    const request: UpdateMissionProgressRequest = {
      api: 'update_utage_onboarding_mission_progress',
      token: session.user.token,
      mission_id: missionId,
      is_complete: isComplete,
    };

    const response = await this.client.post<UpdateMissionProgressResponse>(
      import.meta.env.API_URL as string,
      request,
    );

    return response;
  }

  async getMissionPoint(missionId: number): Promise<GetMissionPointResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    if (!session?.user?.token) {
      throw new Error('Unauthorized');
    }

    const request: GetMissionPointRequest = {
      api: 'get_onboarding_mission_bonus',
      token: session.user.token,
      mission_id: missionId,
    };

    const response = await this.client.post<GetMissionPointResponse>(
      import.meta.env.API_URL as string,
      request,
    );

    return response;
  }
}

export class ClientOnboardingService implements OnboardingService {
  constructor(private readonly client: HttpClient) {}

  async getOnboardingMissions(): Promise<OnboardingProgressData> {
    const response = await this.client.post<OnboardingMissionResponse>(
      HTTP_GET_UTAGE_ONBOARDING_MISSION_PROGRESS,
      {
        isPwa: isPWA(),
      },
    );

    if (response.type === 'error') {
      throw new Error(
        response.message || 'Failed to fetch onboarding missions',
      );
    }

    return convertProgressDataToCamelCase(response);
  }

  async updateMissionProgress(
    missionId: number,
    isComplete: boolean,
  ): Promise<UpdateMissionProgressResponse> {
    const response = await this.client.post<UpdateMissionProgressResponse>(
      HTTP_UPDATE_ONBOARDING_MISSION_PROGRESS,
      {
        missionId,
        isComplete,
      },
    );

    return response;
  }

  async getMissionPoint(missionId: number): Promise<GetMissionPointResponse> {
    const response = await this.client.post<GetMissionPointResponse>(
      HTTP_GET_ONBOARDING_MISSION_BONUS,
      {
        missionId,
      },
    );

    return response;
  }
}

export function createOnboardingService(client: HttpClient): OnboardingService {
  if (client.getContext() === Context.SERVER) {
    return new ServerOnboardingService(client);
  } else {
    return new ClientOnboardingService(client);
  }
}
