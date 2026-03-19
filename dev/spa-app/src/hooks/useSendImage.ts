import { useState } from 'react';
import type { SendMessageRouteResponse } from '@/apis/http/message';
import { HTTP_SEND_IMAGE_MESSAGE } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type SendResult = {
  success: boolean;
  notEnoughPoint?: boolean;
};

type UseSendImageReturn = {
  sendImage: (partnerId: string, fileId: string) => Promise<SendResult>;
  isLoading: boolean;
  error: string | null;
};

export const useSendImage = (): UseSendImageReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendImage = async (
    partnerId: string,
    fileId: string,
  ): Promise<SendResult> => {
    setIsLoading(true);
    setError(null);

    // バリデーション
    if (!partnerId || !fileId) {
      const errorMessage = 'パートナーIDとファイルIDは必須です';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false };
    }

    // fileIdの形式チェック
    if (!fileId.match(/^[a-zA-Z0-9_-]+$/)) {
      const errorMessage = 'ファイルIDの形式が不正です';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false };
    }

    try {
      const client = new ClientHttpClient();
      const response = await client.post<SendMessageRouteResponse>(
        HTTP_SEND_IMAGE_MESSAGE,
        {
          partnerId,
          fileId,
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
        err instanceof Error ? err.message : '画像の送信に失敗しました';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendImage,
    isLoading,
    error,
  };
};
