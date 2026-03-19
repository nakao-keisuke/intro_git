import { useState } from 'react';
import type { AddFavoriteRouteResponse } from '@/apis/http/favorite';
import { HTTP_ADD_FAVORITE } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type AddFavoriteResult = {
  success: boolean;
  errorMessage?: string;
};

type UseFavoriteReturn = {
  addFavorite: (partnerId: string) => Promise<AddFavoriteResult>;
  isLoading: boolean;
  error: string | null;
};

export const useFavorite = (): UseFavoriteReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFavorite = async (partnerId: string): Promise<AddFavoriteResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<AddFavoriteRouteResponse>(
        HTTP_ADD_FAVORITE,
        {
          partnerId,
        },
      );

      if (response.type === 'error') {
        setError(response.message);
        return { success: false, errorMessage: response.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'いいねの送信に失敗しました';
      setError(errorMessage);
      return { success: false, errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addFavorite,
    isLoading,
    error,
  };
};
