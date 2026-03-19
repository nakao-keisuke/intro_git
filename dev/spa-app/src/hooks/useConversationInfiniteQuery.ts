import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { useConversationMore } from '@/hooks/useConversationMore';
import type { ConversationMessage } from '@/services/conversation/type';
import type { ListConversationType } from '@/types/ListConversationType';

export function useConversationInfiniteQuery(
  initialMessages: ConversationMessage[],
  listType: ListConversationType,
  isActive: boolean = true,
) {
  const fetchConversationMore = useConversationMore();

  // 現在時刻の14桁タイムスタンプ（YYYYMMDDHHmmss）を生成
  const nowTimestamp = () => {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0')
    );
  };

  const query = useInfiniteQuery<
    ConversationMessage[],
    Error,
    ConversationMessage[],
    [string, ListConversationType],
    string | undefined
  >({
    queryKey: ['conversations', listType],
    enabled: isActive, // アクティブタブのみfetchを有効化
    queryFn: async ({ pageParam }) => {
      const timeStamp = pageParam || nowTimestamp();
      const messages = await fetchConversationMore({
        listType,
        timeStamp,
        take: 15,
      });
      return messages;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1]?.sentTime;
    },
    initialPageParam: undefined,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: 1 * 60 * 1000, // 1分間はキャッシュを新鮮として扱う（refetchしない）
    gcTime: 5 * 60 * 1000, // 5分間はメモリに保持（ガベージコレクション遅延）
    notifyOnChangeProps: ['data', 'error'], // 不要な再レンダリングを防止
    select: (data) => {
      const allMessages = data.pages.flat();
      const seen = new Set<string>();
      return allMessages.filter((msg) => {
        if (seen.has(msg.frdId)) return false;
        seen.add(msg.frdId);
        return true;
      });
    },
    ...(initialMessages.length > 0
      ? {
          initialData: {
            pages: [initialMessages],
            pageParams: [undefined as string | undefined],
          } satisfies InfiniteData<ConversationMessage[], string | undefined>,
        }
      : {}),
  });

  return query;
}
