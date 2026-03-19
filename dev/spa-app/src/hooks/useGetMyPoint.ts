import { useCallback, useState } from 'react';
import type { GetMyPointRouteResponse } from '@/apis/http/get-my-point';
import { HTTP_GET_MY_POINT } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type UseGetMyPointReturn = {
  // 状態
  point: number | null;
  isLoading: boolean;
  error: string | null;
  // アクション
  fetchPoint: () => Promise<void>;
};

export function useGetMyPoint(): UseGetMyPointReturn {
  const [point, setPoint] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoint = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const response =
        await client.get<GetMyPointRouteResponse>(HTTP_GET_MY_POINT);

      if ('type' in response && response.type === 'error') {
        setError(response.message);
        return;
      }

      setPoint(response.point);
    } catch (err) {
      console.error('Error fetching my point:', err);
      setError('ポイントの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    point,
    isLoading,
    error,
    fetchPoint,
  };
}
