import { useEffect } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { getGoogleClientIdFromCookie } from '@/utils/googleClientId';

/**
 * _ga Cookie から Google Client ID を抽出して Zustand store に保存
 *
 * gtag.js 読み込み後、_ga Cookie が生成されるタイミングで実行される
 * ページロード時に一度だけ実行し、localStorage に保存
 */
export const GoogleClientIdHandler = () => {
  const setGoogleClientId = useAnalyticsStore((s) => s.setGoogleClientId);

  useEffect(() => {
    try {
      const gaValue = getGoogleClientIdFromCookie();
      // GA1. で始まるフォーマットか検証
      if (gaValue?.startsWith('GA1.')) {
        setGoogleClientId(gaValue); // Zustand action が自動的に localStorage に保存
      }
    } catch {
      // Cookie 取得に失敗した場合は何もしない（gtag.js がまだロードされていない可能性がある）
    }
  }, [setGoogleClientId]);

  return null;
};
