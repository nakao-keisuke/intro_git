import { useCallback } from 'react';

/**
 * ブラウザのストレージ（localStorage, sessionStorage, cookie）をクリアするhooks
 */
export const useClearBrowserStorage = () => {
  const clearLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }, []);

  const clearSessionStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.clear();
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error);
      }
    }
  }, []);

  const clearCookies = useCallback(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf('=');
          const name =
            eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          // 複数のパスとドメインパターンで削除を試みる
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        }
      } catch (error) {
        console.warn('Failed to clear cookies:', error);
      }
    }
  }, []);

  const clearAll = useCallback(() => {
    clearLocalStorage();
    clearSessionStorage();
    clearCookies();
  }, [clearLocalStorage, clearSessionStorage, clearCookies]);

  return {
    clearLocalStorage,
    clearSessionStorage,
    clearCookies,
    clearAll,
  };
};
