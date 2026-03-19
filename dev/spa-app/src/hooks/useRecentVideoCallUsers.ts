import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RecentVideoCallUsersMoreRouteResponse } from '@/apis/http/recentVideoCallUsersMore';
import { HTTP_MORE_RECENT_VIDEO_CALL_USERS } from '@/constants/endpoints';
import {
  MIN_REFRESH_LOADING_TIME,
  REACT_QUERY_GC_TIME,
  REACT_QUERY_STALE_TIME,
} from '@/constants/homeCache';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { RecentVideoCallUser } from '@/services/home/type';

type UseRecentVideoCallUsersParams = {
  initialData: RecentVideoCallUser[];
  applicationId: string;
};

export function useRecentVideoCallUsers({
  initialData,
  applicationId,
}: UseRecentVideoCallUsersParams) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ClientHttpClientインスタンスを作成
  const client = useMemo(() => new ClientHttpClient(), []);

  const { data, isLoading } = useQuery({
    queryKey: ['recentVideoCallUsers', applicationId],
    queryFn: async () => {
      // 初回ロードはSSRデータを使用
      return initialData;
    },
    initialData,
    staleTime: REACT_QUERY_STALE_TIME,
    gcTime: REACT_QUERY_GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // router.refresh() 後に新しい initialData が渡された場合、React Query キャッシュを更新
  const prevInitialDataRef = useRef(initialData);

  useEffect(() => {
    if (prevInitialDataRef.current !== initialData) {
      prevInitialDataRef.current = initialData;
      queryClient.setQueryData(
        ['recentVideoCallUsers', applicationId],
        initialData,
      );
    }
  }, [initialData, queryClient, applicationId]);

  // データをそのまま返す（フラット化不要）
  const recentVideoCallUsers = useMemo(() => {
    return data || [];
  }, [data]);

  // 更新ボタン: 最新データを先頭に追加
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const startTime = Date.now();

    try {
      // 最新データ取得
      const response = await client.post<RecentVideoCallUsersMoreRouteResponse>(
        HTTP_MORE_RECENT_VIDEO_CALL_USERS,
        { applicationId },
      );

      if (response.type === 'error') {
        throw new Error(response.message);
      }

      const latestUsers = response.data;

      // データが存在しない場合は何もしない
      if (!latestUsers) return;

      // 既存データの先頭に追加（重複除去）
      queryClient.setQueryData(
        ['recentVideoCallUsers', applicationId],
        (oldData: RecentVideoCallUser[] | undefined) => {
          if (!oldData || oldData.length === 0) return latestUsers;

          const existingIds = new Set(
            oldData.map((u: RecentVideoCallUser) => u.userId),
          );
          const newUsers = latestUsers.filter(
            (u: RecentVideoCallUser) => !existingIds.has(u.userId),
          );

          if (newUsers.length === 0) return oldData;

          return [...newUsers, ...oldData];
        },
      );
    } catch (error) {
      console.error('Failed to refresh recent video call users:', error);
    } finally {
      // 最低ローディング時間を維持（アニメーションを確実に表示）
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_REFRESH_LOADING_TIME - elapsed);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      setIsRefreshing(false);
    }
  }, [client, queryClient, applicationId]);

  return {
    recentVideoCallUsers,
    isLoading,
    isRefreshing,
    handleRefresh,
  };
}
