import { useState } from 'react';
import type { SendMessageRouteResponse } from '@/apis/http/message';
import { HTTP_SEND_STICKER } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type SendResult = {
  success: boolean;
  notEnoughPoint?: boolean;
};

type UseSendStickerReturn = {
  sendSticker: (partnerId: string, content: string) => Promise<SendResult>;
  isLoading: boolean;
  error: string | null;
};

export const useSendSticker = (): UseSendStickerReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendSticker = async (
    partnerId: string,
    content: string,
  ): Promise<SendResult> => {
    setIsLoading(true);
    setError(null);

    // バリデーション
    if (!partnerId || !content) {
      const errorMessage = 'パートナーIDとメッセージ内容は必須です';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false };
    }

    try {
      const client = new ClientHttpClient();
      const response = await client.post<SendMessageRouteResponse>(
        HTTP_SEND_STICKER,
        {
          partnerId,
          content,
        },
      );

      if (response.type === 'error') {
        setError(response.message);
        return {
          success: false,
          ...(response.notEnoughPoint && { notEnoughPoint: true }),
        };
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'スタンプの送信に失敗しました';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendSticker,
    isLoading,
    error,
  };
};
