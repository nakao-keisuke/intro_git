// 最小要件: timeStamp を持つ型
export type WithTimeStamp = { timeStamp: string };

export interface UseInfiniteScrollOptions<T extends WithTimeStamp> {
  initialItems: T[];
  hasMore: boolean;
  fetchMore: (lastItem: T) => Promise<{
    items: T[];
    hasMore: boolean;
  }>;
  rootMargin?: string; // いつ発火するかのmargin
  threshold?: number; // どのぐらい要素が見えたら発火するかを制御
}

export interface UseInfiniteScrollReturn<T> {
  items: T[];
  isLoading: boolean;
  hasMore: boolean;
  lastItemRef: (node: HTMLElement | null) => void; // 最後の要素を参照するためのref
  error: Error | null;
}
