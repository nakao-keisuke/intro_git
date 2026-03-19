declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * WebViewにメッセージを送信し、レスポンスがあればそれを取得する関数
 *
 * @export
 * @param {*} message
 * @param {number} [timeout=555]
 * @returns {Promise<unknown>} Nativeからのレスポンス（タイムアウト時はnullに解決される）
 */
export function sendMessageToWebView(
  message: unknown,
  timeout = 555,
): Promise<unknown> {
  return new Promise((resolve) => {
    let timeoutId: any;

    try {
      // WebViewからのレスポンスを受信するためのハンドラーを登録
      window.handleNativeEvent = (data) => {
        clearTimeout(timeoutId); // タイムアウトを解除
        resolve(data); // レスポンスを解決
        delete window.handleNativeEvent; // 一度だけ処理
      };

      // タイムアウト処理
      timeoutId = setTimeout(() => {
        delete window.handleNativeEvent; // タイムアウト時にハンドラーを削除
        resolve(null);
      }, timeout);

      // メッセージをWebViewに送信
      // React Native WebView向けの通信
      if (window.ReactNativeWebView?.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
      // iOS向けの通信
      else if (window.webkit?.messageHandlers?.nativeHandler) {
        window.webkit.messageHandlers.nativeHandler.postMessage(message);
      }
    } catch {
      clearTimeout(timeoutId);
      resolve(null);
    }
  });
}

/**
 * Utano上で動いているか、Web単体で動いているかを判定する
 * CookieのisUtanoがtrueかどうかで判定する
 *
 * @returns {boolean}
 */
export const isUtano = () => {
  // ブラウザ環境かどうかをチェック
  // ビルド時などではwindowやdocumentがundefinedになるためundefinedかのチェックをする
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false; // または適切なデフォルト値
  }

  const isUtanoString = document?.cookie
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('isUtano'));

  const value = isUtanoString?.split('=')[1];

  const booleanValue = value !== 'false';

  return booleanValue;
};
