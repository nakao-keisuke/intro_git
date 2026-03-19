import { useCallback, useState } from 'react';
import type {
  GetBoardDataRequest,
  GetBoardDataResponse,
} from '@/apis/http/board';
import { HTTP_GET_BOARD_DATA } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

/**
 * 掲示板データ取得カスタムフック
 *
 * 使用場面:
 * - フィルター変更時のデータ再取得
 * - 追加読み込み（Load More）
 */
export function useBoardData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoardData = useCallback(
    async (
      params: GetBoardDataRequest,
      signal?: AbortSignal,
    ): Promise<GetBoardDataResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const httpClient = new ClientHttpClient();
        const response = await httpClient.post<GetBoardDataResponse>(
          HTTP_GET_BOARD_DATA,
          params,
          signal ? { signal } : undefined,
        );

        return response;
      } catch (err) {
        console.error('Board data fetch error:', err);
        setError('データの取得に失敗しました');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    fetchBoardData,
    isLoading,
    error,
  };
}
