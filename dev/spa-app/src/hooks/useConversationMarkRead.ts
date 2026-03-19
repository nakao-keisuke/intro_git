import { useCallback, useMemo } from 'react';
import type { ConversationMarkReadRouteResponse } from '@/apis/http/conversationMarkRead';
import { createConversationMarkReadClientRequest } from '@/apis/http/conversationMarkRead';
import { HTTP_CONVERSATION_MARK_READ } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

/**
 * 会話の既読処理用カスタムフック
 *
 * @returns markRead - 既読処理を実行する関数
 *
 * @example
 * ```tsx
 * const { markRead } = useConversationMarkRead();
 * const success = await markRead(['partnerId1', 'partnerId2']);
 * ```
 */
export const useConversationMarkRead = () => {
  const clientHttpClient = useMemo(() => new ClientHttpClient(), []);

  /**
   * 既読処理を実行
   *
   * @param partnerIds - 既読にする相手のユーザーIDリスト
   * @returns 成功したかどうか
   */
  const markRead = useCallback(
    async (partnerIds: string[]): Promise<boolean> => {
      const request = createConversationMarkReadClientRequest(partnerIds);

      try {
        const response =
          await clientHttpClient.post<ConversationMarkReadRouteResponse>(
            HTTP_CONVERSATION_MARK_READ,
            request,
          );

        return response.type === 'success';
      } catch (error) {
        console.error('Failed to mark as read:', error);
        return false;
      }
    },
    [clientHttpClient],
  );

  return { markRead };
};
