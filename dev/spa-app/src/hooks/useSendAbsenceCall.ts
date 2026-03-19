import { useState } from 'react';
import type { SendMessageRouteResponse } from '@/apis/http/message';
import { HTTP_SEND_ABSENCE_CALL_MESSAGE } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type UseSendAbsenceCallReturn = {
  sendAbsenceCall: (partnerId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
};

export const useSendAbsenceCall = (): UseSendAbsenceCallReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendAbsenceCall = async (partnerId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // バリデーション
    if (!partnerId) {
      const errorMessage = 'パートナーIDは必須です';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }

    try {
      const client = new ClientHttpClient();
      const response = await client.post<SendMessageRouteResponse>(
        HTTP_SEND_ABSENCE_CALL_MESSAGE,
        {
          partnerId,
        },
      );

      if (response.type === 'error') {
        setError(response.message);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '不在着信メッセージの送信に失敗しました';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendAbsenceCall,
    isLoading,
    error,
  };
};
