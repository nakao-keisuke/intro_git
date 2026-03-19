import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { createFleaMarketService } from '@/services/fleamarket/fleaMarketService';
import type { FleaMarketItemWithFavoritesCamel } from '@/services/fleamarket/type';

// フリマ商品一覧の無限取得ロジックをカプセル化
// - 初回は SSR の initialItems を initialData として保持し、キャッシュで状態管理
// - 追加ページはページ番号をインクリメント
// - select で pages をフラット化して配列で返却（コンポーネント側は pages を意識しない）
// - tokenなしでも商品閲覧可能（お気に入り機能はtokenが必要）
// - bookmarkOnly: trueでお気に入りユーザーの商品のみ取得（userId必須）
export function useFleaMarketInfiniteQuery(
  initialItems: FleaMarketItemWithFavoritesCamel[],
  token?: string,
  sellerId?: string,
  category: string = 'all',
  bookmarkOnly?: boolean,
  userId?: string,
) {
  const clientHttpClient = useMemo(() => new ClientHttpClient(), []);
  const fleaMarketService = useMemo(
    () => createFleaMarketService(clientHttpClient),
    [clientHttpClient],
  );

  const query = useInfiniteQuery<
    FleaMarketItemWithFavoritesCamel[],
    Error,
    FleaMarketItemWithFavoritesCamel[],
    [string, string, string, string, string, string | null],
    number
  >({
    queryKey: [
      'fleamarket',
      'items',
      sellerId || 'all',
      category,
      bookmarkOnly ? 'bookmarkOnly' : 'all',
      userId ?? null,
    ],
    queryFn: async ({ pageParam }) => {
      // tokenがない場合は空文字列を渡す（APIルートでゲストアクセス可能）
      const response = await fleaMarketService.getFleaMarketItems(
        sellerId || '',
        token || '',
        {
          category,
          limit: 10,
          page: pageParam,
          ...(bookmarkOnly !== undefined && { bookmarkOnly }),
          ...(userId !== undefined && { userId }),
        },
      );

      return response.items;
    },
    getNextPageParam: (lastPage, allPages) => {
      // 最後のページが10件未満なら終了
      if (!lastPage || lastPage.length < 10) return undefined;
      // 次のページ番号を返す
      return allPages.length + 1;
    },
    initialPageParam: 1,
    retry: 2,
    refetchOnWindowFocus: false, // conversationと異なりリアルタイム更新不要
    refetchOnReconnect: true,
    select: (data) => data.pages.flat(),
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを新鮮とみなす
    gcTime: 30 * 60 * 1000, // 30分間キャッシュを保持
    // サーバーから渡されたデータを初期データとして使用
    ...(initialItems.length > 0
      ? {
          initialData: {
            pages: [initialItems],
            pageParams: [1],
          } satisfies InfiniteData<FleaMarketItemWithFavoritesCamel[], number>,
        }
      : {}),
  });

  return query;
}
