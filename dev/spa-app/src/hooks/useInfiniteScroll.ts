import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  UseInfiniteScrollOptions,
  UseInfiniteScrollReturn,
  WithTimeStamp,
} from '@/types/infiniteScroll';

export function useInfiniteScroll<T extends WithTimeStamp>({
  initialItems,
  hasMore: initialHasMore,
  fetchMore,
  rootMargin = '100px',
  threshold = 0.1,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Observerのインスタンスを保持
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef(false);

  // initialItems/initialHasMore が更新された場合にローカル state を同期
  // router.refresh() によりサーバーから新しい props が渡っても、
  // クライアント側の state が保持されたままだと表示が更新されないため。
  useEffect(() => {
    // サーバーから新しい初期データが来た場合のみ state を同期
    // ここで observer を切断すると初回マウント直後に監視が外れてしまうため、disconnect は行わない
    isFetchingRef.current = false;
    setIsLoading(false);
    setError(null);
    setItems(initialItems);
    setHasMore(initialHasMore);
  }, [initialItems, initialHasMore]);

  // 追加データをフェッチする関数
  const loadMore = useCallback(async () => {
    // ガード: 重複フェッチ防止
    if (isFetchingRef.current || !hasMore || items.length === 0) {
      return;
    }

    const lastItem = items[items.length - 1];
    if (!lastItem) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // timeStamp を使用する場合は fetchMore 側で参照
      const result = await fetchMore(lastItem);

      // 新しいアイテムを追加
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch more items'),
      );
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, items, fetchMore]);

  // 最後の要素に付けるrefコールバック
  const lastItemRef = useCallback(
    (node: HTMLElement | null) => {
      // 前のobserverをクリーンアップ
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // ローディング中またはこれ以上データがない場合は観測しない
      if (isLoading || !hasMore) {
        return;
      }

      // 新しいobserverを作成
      if (node) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) {
              loadMore();
            }
          },
          {
            root: null,
            rootMargin,
            threshold,
          },
        );
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, loadMore, rootMargin, threshold],
  );

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    items,
    isLoading,
    hasMore,
    error,
    lastItemRef,
  };
}
