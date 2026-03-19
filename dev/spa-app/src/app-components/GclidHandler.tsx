import { useEffect } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';

/**
 * URLパラメータからgclidを取得してCookieとZustand storeに保存するコンポーネント
 * Googleアナリティクスのgclid追跡用
 */
export const GclidHandler = () => {
  const setGclid = useAnalyticsStore((s) => s.setGclid);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    // URLパラメータからgclidを取得
    const gclid = urlParams.get('gclid');

    if (gclid) {
      // ZustandのsetGclidに保存（localStorageとCookieに自動保存される）
      setGclid(gclid);
    }
  }, [setGclid]);

  return null; // 表示要素なし
};
