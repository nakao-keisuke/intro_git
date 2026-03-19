import { HTTP_UPDATE_ONBOARDING_MISSION_PROGRESS } from '@/constants/endpoints';
import { MISSION_IDS } from '@/constants/missionIds';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ResponseData } from '@/types/NextApi';

export type CompleteLineMissionApiResponse =
  | {
      type: 'success';
      message: string;
    }
  | {
      type: 'error';
      message: string;
    };

type UpdateMissionProgressResponse = ResponseData<{
  success?: boolean;
  message?: string;
}>;

/**
 * LINE友だち追加ミッションを完了としてマークする
 */
export const completeLineMission =
  async (): Promise<CompleteLineMissionApiResponse> => {
    try {
      const client = new ClientHttpClient();
      const response = await client.post<UpdateMissionProgressResponse>(
        HTTP_UPDATE_ONBOARDING_MISSION_PROGRESS,
        {
          missionId: MISSION_IDS.LINE_FRIEND_ADDITION,
          isComplete: true,
        },
      );

      if (response.type === 'success') {
        return {
          type: 'success',
          message: 'LINE友だち追加ミッションが完了しました！',
        };
      }
      return {
        type: 'error',
        message:
          'message' in response
            ? response.message
            : 'ミッション完了の更新に失敗しました',
      };
    } catch (error) {
      console.error('Complete LINE mission error:', error);

      return {
        type: 'error',
        message: '通信エラーが発生しました',
      };
    }
  };
