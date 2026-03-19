import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '#/hooks/useSession';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MeetPeopleMoreRouteResponse } from '@/apis/http/meetPeopleMore';
import { HTTP_MORE_MEET_PEOPLE_USERS } from '@/constants/endpoints';
import {
  MIN_REFRESH_LOADING_TIME,
  REACT_QUERY_GC_TIME,
  REACT_QUERY_STALE_TIME,
} from '@/constants/homeCache';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { MeetPeople } from '@/services/shared/type';

type UseMeetPeopleInfiniteScrollParams = {
  initialData: MeetPeople[];
};

export function useMeetPeopleInfiniteScroll({
  initialData,
}: UseMeetPeopleInfiniteScrollParams) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ClientHttpClientインスタンスを作成
  const client = useMemo(() => new ClientHttpClient(), []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['meetPeopleUsers', 'all'],
    queryFn: async ({ pageParam }) => {
      // 追加ロード（無限スクロール）
      if (pageParam) {
        const response = await client.post<MeetPeopleMoreRouteResponse>(
          HTTP_MORE_MEET_PEOPLE_USERS,
          { lastLoginTime: pageParam },
        );

        if (response.type === 'error') {
          throw new Error(response.message);
        }

        return response.data;
      }

      // 初回ロードはSSRデータを使用
      return initialData;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) {
        return undefined;
      }

      // 最後のユーザーのlastLoginTimeを次のページパラメータとして返す
      const lastUser = lastPage[lastPage.length - 1];
      return lastUser?.lastLoginTime;
    },
    initialPageParam: undefined as string | undefined,
    initialData: {
      pages: [initialData],
      pageParams: [undefined],
    },
    enabled: !!session?.user.token,
    staleTime: REACT_QUERY_STALE_TIME,
    gcTime: REACT_QUERY_GC_TIME,
  });

  // router.refresh() 後に新しい initialData が渡された場合、React Query キャッシュを更新
  const prevInitialDataRef = useRef(initialData);

  useEffect(() => {
    if (prevInitialDataRef.current !== initialData) {
      prevInitialDataRef.current = initialData;
      queryClient.setQueryData(['meetPeopleUsers', 'all'], {
        pages: [initialData],
        pageParams: [undefined],
      });
    }
  }, [initialData, queryClient]);

  // すべてのページのデータをフラット化（undefinedを除去）
  const meetPeopleUsers = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages
      .flat()
      .filter((user): user is MeetPeople => user !== undefined);
  }, [data]);

  // 更新ボタン: 最新データを先頭に追加
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const startTime = Date.now();

    try {
      // last_login_time: null で最新データ取得
      const response = await client.post<MeetPeopleMoreRouteResponse>(
        HTTP_MORE_MEET_PEOPLE_USERS,
        { lastLoginTime: null },
      );

      if (response.type === 'error') {
        throw new Error(response.message);
      }

      const latestUsers = response.data;

      // データが存在しない場合は何もしない
      if (!latestUsers) return;

      // 既存データの先頭に追加（重複除去）
      queryClient.setQueryData(['meetPeopleUsers', 'all'], (oldData: any) => {
        if (!oldData) return { pages: [latestUsers], pageParams: [undefined] };

        const existingIds = new Set(
          oldData.pages.flat().map((u: MeetPeople) => u.userId),
        );
        const newUsers = latestUsers.filter((u) => !existingIds.has(u.userId));

        if (newUsers.length === 0) return oldData;

        return {
          ...oldData,
          pages: [
            [...newUsers, ...oldData.pages[0]],
            ...oldData.pages.slice(1),
          ],
        };
      });
    } catch (error) {
      console.error('Failed to refresh users:', error);
      // エラー時は通常のrefetchにフォールバック
      await refetch();
    } finally {
      // 最低ローディング時間を維持（アニメーションを確実に表示）
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_REFRESH_LOADING_TIME - elapsed);

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      setIsRefreshing(false);
    }
  }, [client, queryClient, refetch]);

  return {
    meetPeopleUsers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefreshing,
    handleRefresh,
  };
}
