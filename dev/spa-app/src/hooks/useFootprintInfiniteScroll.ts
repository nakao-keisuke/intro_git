import { useCallback, useEffect, useRef, useState } from 'react';
import { useFootprintService } from '@/hooks/useFootprintService';
import type { FootprintListUserInfo } from '@/services/footprint/type';

interface UseFootprintInfiniteScrollOptions {
  initialItems: FootprintListUserInfo[];
}

interface UseFootprintInfiniteScrollReturn {
  items: FootprintListUserInfo[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  error: Error | null;
}

export function useFootprintInfiniteScroll({
  initialItems,
}: UseFootprintInfiniteScrollOptions): UseFootprintInfiniteScrollReturn {
  const [items, setItems] = useState<FootprintListUserInfo[]>(initialItems);
  const [hasMore, setHasMore] = useState(true); // 常にtrueで開始
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentSkip, setCurrentSkip] = useState(initialItems.length);

  const isFetchingRef = useRef(false);

  const footprintService = useFootprintService();

  // 初期データが更新された場合にstateを同期
  useEffect(() => {
    isFetchingRef.current = false;
    setIsLoading(false);
    setError(null);
    setItems(initialItems);
    setCurrentSkip(initialItems.length);
    setHasMore(true); // データ件数に関係なく常にtrue
  }, [initialItems]);

  // 追加データをフェッチする関数
  const loadMore = useCallback(async () => {
    // ガード: 重複フェッチ防止
    if (isFetchingRef.current || !hasMore) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await footprintService.getMoreData?.(currentSkip);

      if (result) {
        // レスポンスのdataが0件の場合のみhasMoreをfalseにする
        if (result.data?.list.length === 0) {
          setHasMore(false);
        } else {
          setItems((prev) => [...prev, ...(result.data?.list ?? [])]);
          setCurrentSkip((prev) => prev + (result.data?.list?.length ?? 0));
          // レスポンスにデータがある限りhasMoreはtrueのまま
          setHasMore(true);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error while loading more items', {
        skip: currentSkip,
        error: err,
      });
      setError(
        err instanceof Error ? err : new Error('Failed to fetch more items'),
      );
      setHasMore(false);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, currentSkip, footprintService]);

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
  };
}
