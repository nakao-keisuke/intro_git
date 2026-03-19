/**
 * クライアントサイドでのCookie操作ユーティリティ
 */

/**
 * Cookie文字列を解析してオブジェクトに変換する
 */
export const parseCookies = (cookieString: string): Record<string, string> => {
  return cookieString
    .split(';')
    .map((cookie: string) => {
      const parts = cookie.trim().split('=');
      return { key: parts[0]?.trim(), value: parts[1] || '' };
    })
    .filter(({ key }) => key)
    .reduce(
      (acc: Record<string, string>, { key, value }) => {
        if (key) {
          try {
            acc[key] = decodeURIComponent(value);
          } catch (_e) {
            // 無効なエンコーディングの場合は元の値をそのまま使用
            acc[key] = value;
          }
        }
        return acc;
      },
      {} as Record<string, string>,
    );
};

/**
 * Cookieに値を設定する
 * @param name - Cookie名
 * @param value - 設定する値
 * @param days - 有効期限（日数）デフォルト: 365日
 */
export const setCookie = (
  name: string,
  value: string,
  days: number = 365,
): void => {
  if (typeof window === 'undefined') {
    // サーバーサイドでは何もしない
    return;
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
};

/**
 * Cookieから値を取得する
 * @param name - Cookie名
 * @returns Cookie値。存在しない場合は空文字列
 */
export const getCookie = (name: string): string => {
  if (typeof window === 'undefined') {
    // サーバーサイドでは空文字列を返す
    return '';
  }

  const cookies = parseCookies(document.cookie);
  return cookies[name] || '';
};

/**
 * Cookieを削除する
 * @param name - Cookie名
 */
export const removeCookie = (name: string): void => {
  if (typeof window === 'undefined') {
    // サーバーサイドでは何もしない
    return;
  }

  // 過去の日付を設定してCookieを削除
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`;
};
