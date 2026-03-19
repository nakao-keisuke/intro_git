import { useState } from 'react';
import type {
  GetMoreTextMessagesRequest,
  GetMoreTextMessagesResponse,
} from '@/apis/http/message';
import { HTTP_GET_TEXT } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ChatInfo } from '@/types/ChatInfo';

type UseGetMoreTextMessagesReturn = {
  loading: boolean;
  error: string | null;
  fetchMoreMessages: (
    partnerId: string,
    timeStamp: string,
  ) => Promise<ChatInfo[] | null>;
};

/**
 * 過去メッセージ取得のCustom Hook
 *
 * @example
 * const { loading, error, fetchMoreMessages } = useGetMoreTextMessages();
 * const messages = await fetchMoreMessages(partnerId, oldestMessageTimeStamp);
 */
export function useGetMoreTextMessages(): UseGetMoreTextMessagesReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoreMessages = async (
    partnerId: string,
    timeStamp: string,
  ): Promise<ChatInfo[] | null> => {
    if (!partnerId) {
      setError('partnerId is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const request: GetMoreTextMessagesRequest = {
        partnerId,
        timeStamp,
      };

      const response = await client.post<GetMoreTextMessagesResponse>(
        HTTP_GET_TEXT,
        request,
      );

      if (response.type === 'error') {
        setError(response.message || '過去のメッセージの取得に失敗しました');
        return null;
      }

      const data = response.data ?? [];

      return data;
    } catch (err) {
      console.error(err);
      setError('過去のメッセージの取得に失敗しました');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchMoreMessages };
}
