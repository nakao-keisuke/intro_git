import { useState } from 'react';
import type {
  AddFleaMarketFavoriteRouteResponse,
  RemoveFleaMarketFavoriteRouteResponse,
} from '@/apis/http/fleamarket';
import {
  HTTP_ADD_FLEA_MARKET_FAVORITE,
  HTTP_REMOVE_FLEA_MARKET_FAVORITE,
} from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type UseFleaMarketFavoriteReturn = {
  addFavorite: (itemId: string) => Promise<boolean>;
  removeFavorite: (itemId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
};

export const useFleaMarketFavorite = (): UseFleaMarketFavoriteReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFavorite = async (itemId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<AddFleaMarketFavoriteRouteResponse>(
        HTTP_ADD_FLEA_MARKET_FAVORITE,
        {
          itemId,
        },
      );

      if (response.type === 'error') {
        setError(response.message);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'お気に入りの追加に失敗しました';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (itemId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<RemoveFleaMarketFavoriteRouteResponse>(
        HTTP_REMOVE_FLEA_MARKET_FAVORITE,
        {
          itemId,
        },
      );

      if (response.type === 'error') {
        setError(response.message);
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'お気に入りの削除に失敗しました';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addFavorite,
    removeFavorite,
    isLoading,
    error,
  };
};
