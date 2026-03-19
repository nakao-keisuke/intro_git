import { useState } from 'react';
import type {
  NotifyPointShortageRequest,
  NotifyPointShortageResponse,
} from '@/apis/http/notification';
import { HTTP_UTAGE_NOT_ENOUGH_POINT } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ErrorData, ResponseData } from '@/types/NextApi';

type UseNotifyPointShortageReturn = {
  notify: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
};

/**
 * ポイント不足通知カスタムフック
 * ポイント不足時にJambo APIへ通知を送信する
 */
export const useNotifyPointShortage = (): UseNotifyPointShortageReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notify = async (): Promise<boolean> => {
    if (isLoading) return false;
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const requestBody: NotifyPointShortageRequest = {};

      const response = await client.post<
        ResponseData<NotifyPointShortageResponse>
      >(HTTP_UTAGE_NOT_ENOUGH_POINT, requestBody);

      if (response.type === 'error') {
        setError(response.message || '通知の送信に失敗しました');
        return false;
      }

      // 成功
      return true;
    } catch (err) {
      console.error('Point shortage notification error:', err);
      const errorMessage =
        err instanceof Error ? err.message : '通知の送信に失敗しました';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { notify, isLoading, error };
};
