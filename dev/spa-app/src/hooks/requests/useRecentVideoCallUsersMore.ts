import { useState } from 'react';
import type {
  RecentVideoCallUsersMoreClientRequest,
  RecentVideoCallUsersMoreRouteResponse,
} from '@/apis/http/recentVideoCallUsersMore';
import { createRecentVideoCallUsersMoreClientRequest } from '@/apis/http/recentVideoCallUsersMore';
import { HTTP_MORE_RECENT_VIDEO_CALL_USERS } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { RecentVideoCallUser } from '@/services/home/type';

type UseRecentVideoCallUsersMoreReturn = {
  fetchRecentVideoCallUsers: (applicationId: string) => Promise<FetchResult>;
  isLoading: boolean;
  error: string | null;
  response: RecentVideoCallUsersMoreRouteResponse | null;
};

type FetchResult = {
  success: boolean;
  data?: RecentVideoCallUser[];
};

/**
 * 今すぐビデオ通話できるユーザー一覧の取得用カスタムフック
 */
export const useRecentVideoCallUsersMore =
  (): UseRecentVideoCallUsersMoreReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] =
      useState<RecentVideoCallUsersMoreRouteResponse | null>(null);

    const fetchRecentVideoCallUsers = async (
      applicationId: string,
    ): Promise<FetchResult> => {
      if (isLoading) return { success: false };
      setIsLoading(true);
      setError(null);

      try {
        const client = new ClientHttpClient();
        const requestBody: RecentVideoCallUsersMoreClientRequest =
          createRecentVideoCallUsersMoreClientRequest(applicationId);
        const res = await client.post<RecentVideoCallUsersMoreRouteResponse>(
          HTTP_MORE_RECENT_VIDEO_CALL_USERS,
          requestBody,
        );

        setResponse(res);

        if (res.type === 'error') {
          setError(res.message || 'ユーザー一覧の取得に失敗しました');
          return { success: false };
        }

        return {
          success: true,
          ...(res.data && { data: res.data }),
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'ユーザー一覧の取得に失敗しました';
        setError(errorMessage);
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    };

    return { fetchRecentVideoCallUsers, isLoading, error, response };
  };
