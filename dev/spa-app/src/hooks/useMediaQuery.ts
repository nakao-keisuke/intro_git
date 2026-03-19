import { useEffect, useState } from 'react';

/**
 * メディアクエリの状態を監視するカスタムフック
 * SSRハイドレーションエラーを防ぐため、マウント前は常にfalseを返す
 * @param query - メディアクエリ文字列（例: '(min-width: 768px)'）
 * @returns マッチ状態（true/false）
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return isMounted ? matches : false;
}

// Tailwindのmdブレークポイント
export const BREAKPOINTS = {
  md: '(min-width: 768px)',
} as const;
