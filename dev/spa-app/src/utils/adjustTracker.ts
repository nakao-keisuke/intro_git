import { isNativeApplication } from '@/constants/applicationId';
import { sendMessageToWebView } from '@/utils/webview';

/**
 * Adjustイベントを送信する
 * ネイティブアプリ(Renka)の場合のみpostMessage経由で送信
 * Web版では送信しない
 *
 * @param eventToken イベントトークン
 * @param params オプショナルなイベントパラメータ
 */
export const trackAdjustEvent = (
  eventToken: string,
  params?: {
    callbackParams?: Array<{ key: string; value: string }>;
    partnerParams?: Array<{ key: string; value: string }>;
  },
): void => {
  try {
    if (isNativeApplication()) {
      // ネイティブアプリ(Renka)にpostMessageで送信
      sendMessageToWebView({
        type: 'ADJUST_TRACK_EVENT',
        payload: {
          eventToken,
          callbackParams: params?.callbackParams ?? [],
          partnerParams: params?.partnerParams ?? [],
        },
      });
    }
    // Web版では何もしない
  } catch (_error) {
    // Adjustイベント送信は補助的な機能のため、静かに失敗
  }
};

/**
 * Adjustイベントを非同期で送信する
 * ページレンダリングをブロックしないようにsetTimeoutを使用
 *
 * @param eventToken イベントトークン
 * @param params オプショナルなイベントパラメータ
 */
export const trackAdjustEventAsync = (
  eventToken: string,
  params?: {
    callbackParams?: Array<{ key: string; value: string }>;
    partnerParams?: Array<{ key: string; value: string }>;
  },
): void => {
  const executeTracking = () => {
    trackAdjustEvent(eventToken, params);
  };

  // 確実に実行するためsetTimeoutを使用
  setTimeout(executeTracking, 0);
};
