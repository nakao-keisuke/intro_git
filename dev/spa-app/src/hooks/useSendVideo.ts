import { useState } from 'react';
import type { SendMessageRouteResponse } from '@/apis/http/message';
import { HTTP_SEND_VIDEO_MESSAGE } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type SendResult = {
  success: boolean;
  notEnoughPoint?: boolean;
};

type UseSendVideoReturn = {
  sendVideo: (
    partnerId: string,
    fileId: string,
    duration: number,
  ) => Promise<SendResult>;
  isLoading: boolean;
  error: string | null;
};

export const useSendVideo = (): UseSendVideoReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVideo = async (
    partnerId: string,
    fileId: string,
    duration: number,
  ): Promise<SendResult> => {
    setIsLoading(true);
    setError(null);

    // バリデーション
    if (!partnerId || !fileId || duration === undefined) {
      const errorMessage = 'パートナーID、ファイルID、動画の長さは必須です';
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

    // durationの範囲チェック
    if (duration < 0) {
      const errorMessage = '動画の長さは0以上である必要があります';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false };
    }

    try {
      const client = new ClientHttpClient();
      const response = await client.post<SendMessageRouteResponse>(
        HTTP_SEND_VIDEO_MESSAGE,
        {
          partnerId,
          fileId,
          duration,
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
        err instanceof Error ? err.message : '動画の送信に失敗しました';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendVideo,
    isLoading,
    error,
  };
};
