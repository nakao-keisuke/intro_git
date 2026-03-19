import { useCallback, useEffect } from 'react';

interface FavoriteSyncData {
  itemId: string;
  isFavorited: boolean;
  favCount: number;
}

type FavoriteSyncListener = (data: FavoriteSyncData) => void;

class FavoriteSyncManager {
  private listeners: Set<FavoriteSyncListener> = new Set();

  subscribe(listener: FavoriteSyncListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(data: FavoriteSyncData) {
    this.listeners.forEach((listener) => listener(data));
  }
}

const favoriteSyncManager = new FavoriteSyncManager();

export const useFavoriteSync = (onFavoriteChange?: FavoriteSyncListener) => {
  useEffect(() => {
    if (onFavoriteChange) {
      return favoriteSyncManager.subscribe(onFavoriteChange);
    }
    return undefined;
  }, [onFavoriteChange]);

  const notifyFavoriteChange = useCallback((data: FavoriteSyncData) => {
    favoriteSyncManager.notify(data);
  }, []);

  return { notifyFavoriteChange };
};
