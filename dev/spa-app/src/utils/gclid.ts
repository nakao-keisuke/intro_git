/**
 * Cookie文字列を解析してオブジェクトに変換する共通関数
 * @param cookieString Cookie文字列
 * @returns 解析されたCookieオブジェクト
 */
const parseCookies = (cookieString: string): Record<string, string> => {
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
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      },
      {} as Record<string, string>,
    );
};

/**
 * CookieからGCLIDを取得する関数（クライアント側）
 * 存在しない場合はnullを返す
 *
 * @returns GCLID文字列またはnull
 */
export const getGclidFromCookie = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookies = parseCookies(document.cookie);
  return cookies.gclid || null;
};

/**
 * サーバー側でCookieヘッダーからGCLIDを取得する関数
 * 存在しない場合はnullを返す
 *
 * @param cookieHeader Cookie ヘッダー文字列
 * @returns GCLID文字列またはnull
 */
export const getGclidFromServerCookie = (
  cookieHeader: string,
): string | null => {
  const cookies = parseCookies(cookieHeader);
  return cookies.gclid || null;
};

/**
 * localStorageからGCLIDを取得する関数（クライアント側）
 * 存在しない場合はnullを返す
 *
 * @returns GCLID文字列またはnull
 */
export const getGclidFromLocalStorage = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('gclid');
};

/**
 * 利用可能な方法からGCLIDを取得する関数
 * 優先順位：localStorage → Cookie
 *
 * @returns GCLID文字列またはnull
 */
export const getGclid = (): string | null => {
  return getGclidFromLocalStorage() || getGclidFromCookie();
};
