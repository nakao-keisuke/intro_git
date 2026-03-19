import { useCallback } from 'react';
import { useMyPoint } from '@/hooks/usePollingData';
import { usePointStore } from '@/stores/pointStore';

/**
 * Zustand の currentPoint を最新値に更新するための関数を返すフック。
 * 呼び出し側（送信成功時など）から直接呼ぶことで、イベント依存を避けて即時反映できる。
 */
export const useRefreshMyPoint = () => {
  const syncWithPolling = usePointStore((s) => s.syncWithPolling);
  const myPointData = useMyPoint();

  // ポーリング済みの最新値を currentPoint に同期するだけ（ネットワーク呼び出し無し）
  const refresh = useCallback(() => {
    const next = myPointData?.data?.point;
    if (typeof next === 'number' && !Number.isNaN(next)) {
      syncWithPolling(next);
    }
  }, [syncWithPolling, myPointData?.data?.point]);

  return refresh;
};
