import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { HTTP_CONVERSATION_PREFETCH } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ConversationMessage } from '@/services/conversation/type';
import type { ListConversationType } from '@/types/ListConversationType';

type PrefetchResponse = {
  type: 'success' | 'error';
  data?: Partial<Record<ListConversationType, ConversationMessage[]>>;
  message?: string;
};

/**
 * 会話一覧の複数タブを1リクエストでprefetchするカスタムフック
 * @returns prefetchTabs - 複数タブを一括取得してReact Queryキャッシュにセットする関数
 * @example
 * ```tsx
 * const prefetchTabs = useConversationPrefetch();
 * // 非表示タブを取得
 * await prefetchTabs(['conversation', 'bookmark']);
 * ```
 */
export function useConversationPrefetch() {
  const queryClient = useQueryClient();
  const clientHttpClient = useMemo(() => new ClientHttpClient(), []);

  /**
   * 複数タブを1リクエストで取得し、React Queryキャッシュにセット
   * @param tabs - 取得したいタブの配列
   */
  const prefetchTabs = useCallback(
    async (tabs: ListConversationType[]): Promise<void> => {
      try {
        // バッチAPIで複数タブを一括取得
        const response = await clientHttpClient.post<PrefetchResponse>(
          HTTP_CONVERSATION_PREFETCH,
          { tabs },
        );

        if (response.type === 'success' && response.data) {
          // 各タブのデータをReact Queryキャッシュにセット
          tabs.forEach((tab) => {
            const messages = response.data?.[tab] || [];

            // InfiniteQueryの形式でキャッシュにセット
            queryClient.setQueryData<
              InfiniteData<ConversationMessage[], string | undefined>
            >(['conversations', tab], {
              pages: [messages],
              pageParams: [undefined],
            });
          });
        } else {
          console.error('Failed to prefetch tabs:', response.message);
        }
      } catch (error) {
        console.error('Error prefetching tabs:', error);
      }
    },
    [clientHttpClient, queryClient],
  );

  return {
    prefetchTabs,
  };
}
