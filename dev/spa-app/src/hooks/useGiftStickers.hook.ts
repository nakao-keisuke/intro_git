import { useEffect, useState } from 'react';
import {
  GIFT_STICKERS_CACHE_DURATION,
  GIFT_STICKERS_STORAGE_KEY,
} from '@/constants/giftStickers';
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

export const useGiftStickers = () => {
  const [stickers, setStickers] = useState<StampImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGiftStickers = async () => {
      try {
        // localStorageからキャッシュを確認
        const cached = localStorage.getItem(GIFT_STICKERS_STORAGE_KEY);

        if (cached) {
          const cachedData: CachedData = JSON.parse(cached);
          const now = Date.now();

          // キャッシュが有効期限内かチェック
          if (now - cachedData.timestamp < GIFT_STICKERS_CACHE_DURATION) {
            setStickers(cachedData.stickers);
            setLoading(false);
            return;
          }
        }

        // キャッシュがないか期限切れの場合、APIから取得
        const response = await postToNext<{
          stickers: StampImage[];
          timestamp: number;
        }>('/api/get-gift-stickers');

        if (response.type !== 'success') {
          throw new Error('Failed to fetch gift stickers');
        }

        const data = await response;

        // localStorageに保存
        const cacheData: CachedData = {
          stickers: data.stickers,
          timestamp: data.timestamp,
        };
        localStorage.setItem(
          GIFT_STICKERS_STORAGE_KEY,
          JSON.stringify(cacheData),
        );

        setStickers(data.stickers);
      } catch (err) {
        console.error('Error fetching gift stickers:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');

        // エラー時でも古いキャッシュがあれば使用
        const cached = localStorage.getItem(GIFT_STICKERS_STORAGE_KEY);
        if (cached) {
          const cachedData: CachedData = JSON.parse(cached);
          setStickers(cachedData.stickers);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGiftStickers();
  }, []);

  return { stickers, loading, error };
};
