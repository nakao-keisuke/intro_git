import { create } from 'zustand';
import { getGclidFromCookie } from '@/utils/gclid';
import {
  getGoogleClientIdFromCookie,
  saveGoogleClientIdToLocalStorage,
} from '@/utils/googleClientId';

// GCLID Cookie設定定数
const GCLID_COOKIE_CONFIG = {
  MAX_AGE_DAYS: 30,
  PATH: '/',
  SECURE: true,
  SAME_SITE: 'lax' as const,
} as const;

/**
 * Analytics Store
 *
 * Google Client ID と GCLID を管理
 * localStorage と Cookie の両方で永続化を行う
 */
type AnalyticsStore = {
  /** Google Client ID (_ga Cookie から取得) */
  googleClientId: string | null;

  /** Google Click ID (URLパラメータから取得) */
  gclid: string | null;

  /** Google Client ID を設定 (localStorageに自動保存) */
  setGoogleClientId: (clientId: string | null) => void;

  /** GCLID を設定 (localStorageとCookieに自動保存) */
  setGclid: (gclid: string | null) => void;
};

// 初期値を取得する関数（クライアントサイドでのみ実行）
const getInitialGoogleClientId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const storedClientId = localStorage.getItem('client_id');
  return storedClientId || getGoogleClientIdFromCookie();
};

const getInitialGclid = (): string | null => {
  if (typeof window === 'undefined') return null;
  const storedGclid = localStorage.getItem('gclid');
  return storedGclid || getGclidFromCookie();
};

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  // 初期値はクライアントサイドで localStorage/Cookie から復元
  googleClientId: getInitialGoogleClientId(),
  gclid: getInitialGclid(),

  setGoogleClientId: (clientId) => {
    // localStorageに保存
    if (clientId && typeof window !== 'undefined') {
      saveGoogleClientIdToLocalStorage(clientId);
    }
    set({ googleClientId: clientId });
  },

  setGclid: (newGclid) => {
    if (typeof window !== 'undefined') {
      if (newGclid === null || newGclid === undefined) {
        // 値がクリアされた場合は両方から削除
        localStorage.removeItem('gclid');
        document.cookie = `gclid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${GCLID_COOKIE_CONFIG.PATH}; secure; samesite=${GCLID_COOKIE_CONFIG.SAME_SITE}`;
      } else {
        // 新しい値を両方に保存
        localStorage.setItem('gclid', newGclid);

        // Cookieは30日間有効（フォールバック・サーバーサイド利用用）
        const expires = new Date();
        expires.setDate(expires.getDate() + GCLID_COOKIE_CONFIG.MAX_AGE_DAYS);
        const cookieString = `gclid=${encodeURIComponent(newGclid)}; expires=${expires.toUTCString()}; path=${GCLID_COOKIE_CONFIG.PATH}; secure; samesite=${GCLID_COOKIE_CONFIG.SAME_SITE}`;
        document.cookie = cookieString;
      }
    }
    set({ gclid: newGclid });
  },
}));
