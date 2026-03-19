/**
 * Google Analytics 4 Client ID (google_client_id) の取得・保存ユーティリティ
 *
 * 注意: google_client_id と client_id は同じ値を指します
 * - Cookie: _ga (gtag.js が自動生成)
 * - localStorage: client_id
 */

/**
 * _ga Cookie から Google Analytics Client ID を取得（クライアント側）
 * purchaseUtils.ts の getClientIdFromCookie() と同じ実装
 * @returns Client ID (例: 'GA1.1.123456789.1234567890') または null
 */
export const getGoogleClientIdFromCookie = (): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split('; ');
  const gaCookie = cookies.find((cookie) => cookie.startsWith('_ga='));

  if (!gaCookie) {
    return null;
  }

  // _ga cookie format: GA1.2.123456789.1234567890
  const gaValue = gaCookie.split('=')[1];
  return gaValue?.trim() ? gaValue : null;
};

/**
 * _ga Cookie から Google Analytics Client ID を取得（サーバー側）
 * @param cookieHeader Cookie ヘッダー文字列
 * @returns Client ID または null
 */
export const getGoogleClientIdFromServerCookie = (
  cookieHeader: string,
): string | null => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split('; ');
  const gaCookie = cookies.find((cookie) => cookie.startsWith('_ga='));

  if (!gaCookie) return null;

  const gaValue = gaCookie.split('=')[1];
  return gaValue?.trim() ? gaValue : null;
};

/**
 * localStorage から client_id (google_client_id) を取得
 * @returns Client ID または null
 */
export const getGoogleClientIdFromLocalStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('client_id');
};

/**
 * google_client_id を保存（localStorage のみ）
 * Cookie (_ga) は gtag.js が自動管理するため、手動保存は不要
 * @param clientId Client ID
 */
export const saveGoogleClientIdToLocalStorage = (clientId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('client_id', clientId);
};

/**
 * google_client_id を取得（優先順位: localStorage → Cookie）
 * @returns Client ID または null
 */
export const getGoogleClientId = (): string | null => {
  return getGoogleClientIdFromLocalStorage() || getGoogleClientIdFromCookie();
};
