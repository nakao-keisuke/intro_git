import { useCallback, useState } from 'react';
import type {
  PostBoardMessageRequest,
  PostBoardMessageResponse,
} from '@/apis/http/board';
import { HTTP_POST_BOARD_MESSAGE } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

/**
 * 掲示板投稿カスタムフック
 *
 * 使用場面:
 * - 1-Tap投稿
 * - 自由投稿
 */
export function useBoardPost() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postMessage = useCallback(
    async (message: string): Promise<PostBoardMessageResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const httpClient = new ClientHttpClient();
        const response = await httpClient.post<PostBoardMessageResponse>(
          HTTP_POST_BOARD_MESSAGE,
          { message } as PostBoardMessageRequest,
        );

        return response;
      } catch (err) {
        console.error('Board post error:', err);
        setError('投稿に失敗しました');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    postMessage,
    isLoading,
    error,
  };
}
