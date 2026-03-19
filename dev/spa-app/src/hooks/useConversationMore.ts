import { useMemo } from 'react';
import type { ConversationMoreRouteResponse } from '@/apis/http/conversationMore';
import { createConversationMoreClientRequest } from '@/apis/http/conversationMore';
import { HTTP_GET_CONVERSATION_MORE } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ConversationMessage } from '@/services/conversation/type';
import type { ListConversationType } from '@/types/ListConversationType';

/**
 * 会話一覧の追加読み込み用カスタムフック
 *
 * @returns fetchConversationMore - 会話一覧を追加取得する関数
 *
 * @example
 * ```tsx
 * const fetchConversationMore = useConversationMore();
 * const messages = await fetchConversationMore({
 *   listType: 'all',
 *   timeStamp: '20260116120000',
 *   take: 15,
 * });
 * ```
 */
export function useConversationMore() {
  const clientHttpClient = useMemo(() => new ClientHttpClient(), []);

  /**
   * 会話一覧の追加読み込みを実行
   *
   * @param params - リクエストパラメータ
   * @param params.listType - 会話一覧の種類 ('all' | 'conversation' | 'bookmark')
   * @param params.timeStamp - カーソル（最後のメッセージのsentTime）
   * @param params.take - 取得件数（デフォルト: 15）
   * @returns 会話メッセージの配列
   * @throws エラーレスポンスの場合はエラーをthrow
   */
  const fetchConversationMore = async (params: {
    listType: ListConversationType;
    timeStamp: string;
    take?: number;
  }): Promise<ConversationMessage[]> => {
    const request = createConversationMoreClientRequest(
      params.listType,
      params.timeStamp,
      params.take,
    );

    const response = await clientHttpClient.post<ConversationMoreRouteResponse>(
      HTTP_GET_CONVERSATION_MORE,
      request,
    );

    // ApiRouteResponse形式のレスポンスから成功時のdataを抽出
    if (response.type === 'success' && response.data) {
      return response.data;
    }

    // エラー時はthrow
    throw new Error(response.message || '会話一覧の取得に失敗しました');
  };

  return fetchConversationMore;
}
