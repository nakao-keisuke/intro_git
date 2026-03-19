import { useEffect, useState } from 'react';
import { postToNext } from '@/utils/next';

type StampImage = {
  url: string;
  categoryId: string;
  name: string;
  number: number;
};

type CachedData = {
  stickers: StampImage[];
  timestamp: number;
};

const STORAGE_KEY = 'all_stickers_cache_v1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h

export const useStickers = () => {
  const [stickers, setStickers] = useState<StampImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const cachedData: CachedData = JSON.parse(cached);
          if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
            setStickers(cachedData.stickers);
            setLoading(false);
            return;
          }
        }

        const response = await postToNext<{
          stickers: StampImage[];
          timestamp: number;
        }>('/api/get-stickers');

        if ((response as any).type !== 'success') {
          throw new Error('Failed to fetch stickers');
        }

        const data = response as unknown as {
          stickers: StampImage[];
          timestamp: number;
        };
        const cacheData: CachedData = {
          stickers: data.stickers,
          timestamp: data.timestamp,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
        setStickers(data.stickers);
      } catch (err) {
        console.error('Error fetching stickers:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const cachedData: CachedData = JSON.parse(cached);
          setStickers(cachedData.stickers);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStickers();
  }, []);

  return { stickers, loading, error };
};
