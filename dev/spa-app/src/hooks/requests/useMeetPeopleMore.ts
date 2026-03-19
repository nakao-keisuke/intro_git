import { useState } from 'react';
import type {
  MeetPeopleMoreClientRequest,
  MeetPeopleMoreRouteResponse,
} from '@/apis/http/meetPeopleMore';
import { createMeetPeopleMoreClientRequest } from '@/apis/http/meetPeopleMore';
import { HTTP_MORE_MEET_PEOPLE_USERS } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { MeetPeople } from '@/services/shared/type';

type UseMeetPeopleMoreReturn = {
  fetchMoreUsers: (lastLoginTime: string | null) => Promise<FetchResult>;
  isLoading: boolean;
  error: string | null;
  response: MeetPeopleMoreRouteResponse | null;
};

type FetchResult = {
  success: boolean;
  data?: MeetPeople[];
};

/**
 * 今すぐ話せるユーザーの追加読み込み用カスタムフック
 */
export const useMeetPeopleMore = (): UseMeetPeopleMoreReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<MeetPeopleMoreRouteResponse | null>(
    null,
  );

  const fetchMoreUsers = async (
    lastLoginTime: string | null,
  ): Promise<FetchResult> => {
    if (isLoading) return { success: false };
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const requestBody: MeetPeopleMoreClientRequest =
        createMeetPeopleMoreClientRequest(lastLoginTime);
      const res = await client.post<MeetPeopleMoreRouteResponse>(
        HTTP_MORE_MEET_PEOPLE_USERS,
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
        err instanceof Error ? err.message : 'ユーザー一覧の取得に失敗しました';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchMoreUsers, isLoading, error, response };
};
