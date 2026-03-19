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
 * Cookieからcm_codeを取得する関数（クライアント側）
 * 存在しない場合は'Organic'を返す
 *
 * @returns cmCode文字列（デフォルト: 'Organic'）
 */
export const getCmCodeFromCookie = (): string => {
  if (typeof window === 'undefined') {
    return 'Organic';
  }

  const cookies = parseCookies(document.cookie);
  return cookies.cm_code || 'Organic';
};

/**
 * サーバー側でCookieヘッダーからcm_codeを取得する関数
 * 存在しない場合は'Organic'を返す
 *
 * @param cookieHeader Cookie ヘッダー文字列
 * @returns cmCode文字列（デフォルト: 'Organic'）
 */
export const getCmCodeFromServerCookie = (cookieHeader: string): string => {
  const cookies = parseCookies(cookieHeader);
  return cookies.cm_code || 'Organic';
};

/**
 * サーバー側でCookieヘッダーから全てのASPパラメータを取得する関数
 *
 * @param cookieHeader Cookie ヘッダー文字列
 * @param aspParamNames 取得したいASPパラメータ名の配列
 * @returns ASPパラメータのオブジェクト（キー: パラメータ名、値: パラメータ値）
 */
export const getAllAspParamsFromServerCookie = (
  cookieHeader: string,
  aspParamNames: string[],
): Record<string, string> => {
  const cookies = parseCookies(cookieHeader);
  const aspParams: Record<string, string> = {};

  aspParamNames.forEach((paramName) => {
    const value = cookies[paramName];
    if (value) {
      aspParams[paramName] = value;
    }
  });

  return aspParams;
};

/**
 * サーバー側でCookieヘッダーからUTMパラメータを取得する関数
 *
 * @param cookieHeader Cookie ヘッダー文字列
 * @returns UTMパラメータのオブジェクト（utm_campaign, utm_sourceなど）
 */
export const getUtmParamsFromServerCookie = (
  cookieHeader: string,
): Record<string, string> => {
  const cookies = parseCookies(cookieHeader);
  const utmParams: Record<string, string> = {};

  // 必要なUTMパラメータのみ取得
  const utmParamNames = ['utm_campaign', 'utm_source', 'utm_medium'];

  utmParamNames.forEach((paramName) => {
    const value = cookies[paramName];
    if (value) {
      utmParams[paramName] = value;
    }
  });

  return utmParams;
};
