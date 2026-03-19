import { useCallback, useEffect, useState } from 'react';
import type {
  GetBadgeProgressData,
  GetBadgeProgressRouteResponse,
} from '@/apis/http/badge';
import { HTTP_BADGE_PROGRESS } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

const FETCH_ERROR_MESSAGE = 'バッジ進捗の取得に失敗しました';

type UseBadgeProgressReturn = {
  data: GetBadgeProgressData | null;
  isLoading: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
};

export const useBadgeProgress = (
  targetUserId: string,
): UseBadgeProgressReturn => {
  const [data, setData] = useState<GetBadgeProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!targetUserId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const client = new ClientHttpClient();
      const requestBody = { partner_id: targetUserId };

      const response = await client.post<GetBadgeProgressRouteResponse>(
        HTTP_BADGE_PROGRESS,
        requestBody,
      );

      if (response.type === 'error') {
        setErrorMessage(response.message);
        setData(null);
      } else {
        setData(response.data ?? null);
      }
    } catch (error) {
      console.error('[useBadgeProgress] 例外発生', error);
      setErrorMessage(FETCH_ERROR_MESSAGE);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  return {
    data,
    isLoading,
    errorMessage,
    refetch: fetchProgress,
  };
};
