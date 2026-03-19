import { isGAEnabled } from '@/app/components/GoogleAnalytics';
import { isNativeApplication } from '@/constants/applicationId';
import {
  CONFIG_TO_EVENT_KEY_MAP,
  GA4_TO_EVENT_KEY_MAP,
} from '@/constants/eventMaps';
import { EVENT_NAMES } from '@/constants/eventNames';
import {
  EventProvider,
  type EventTokenConfig,
} from '@/constants/eventProviders';
import { event } from '@/constants/ga4Event';
import { trackAdjustEventAsync as trackAdjustEventAsyncCore } from './adjustTracker';
import { sendGA4ClientEvent } from './ga4';
import { getCurrentAdjustPlatform } from './platform';
import { sendMessageToWebView } from './webview';

declare const window: Window & { dataLayer: any[] };

// GA4イベントパラメータの型定義
export type GA4EventParameters = Record<
  string,
  string | number | undefined | null
>;

// Reproイベントパラメータの型定義
export type ReproEventParameters = Record<
  string,
  string | number | boolean | object | undefined | null
>;

export const trackEvent = (
  eventName: keyof typeof event | string | EventTokenConfig,
  parameters?: GA4EventParameters,
) => {
  // イベント設定を取得
  let eventConfig: EventTokenConfig | null;

  if (typeof eventName === 'object') {
    // EventTokenConfigオブジェクトが直接渡された場合
    eventConfig = eventName;
  } else if (eventName in event) {
    // イベント名のキーが渡された場合
    eventConfig = event[eventName as keyof typeof event];
  } else {
    // 文字列が渡された場合
    eventConfig = null;
  }

  // 1. GA4送信
  const ga4Key =
    eventConfig?.[EventProvider.GA4] ??
    (typeof eventName === 'string' ? eventName : undefined);
  if (ga4Key) {
    sendGA4ClientEvent('event', ga4Key, parameters);
  }

  // 2. Repro送信
  // Reproには必ずkeyを渡す
  if (typeof eventName === 'object') {
    // EventTokenConfigオブジェクトの場合、逆引きマップから取得 (O(1))
    const key = CONFIG_TO_EVENT_KEY_MAP.get(eventName);
    if (key) {
      trackReproEventAsync(key, parameters);
    }
  } else if (typeof eventName === 'string' && !(eventName in event)) {
    // 文字列で渡された場合、逆引きマップから取得 (O(1))
    const key = GA4_TO_EVENT_KEY_MAP[eventName];
    if (key) {
      trackReproEventAsync(key, parameters);
    }
  } else if (eventName in event) {
    trackReproEventAsync(eventName as keyof typeof event, parameters);
  }

  // 3. Adjust送信（Renka/Native向け）
  // 対応イベントのみ送信（ホワイトリスト方式）
  try {
    // GA/WEB側では送らず、Renka(NATIVE)の場合のみpostMessage経由で送信
    if (!isNativeApplication()) return;
    if (!eventConfig) return;

    // Adjustトークンを取得
    const adjustTokens = eventConfig[EventProvider.Adjust];
    if (!adjustTokens) return; // トークン未定義のイベントは送信しない

    // 現在のプラットフォーム取得（iOS/Android、デフォルトはiOS）
    const currentPlatform = getCurrentAdjustPlatform();
    const token = adjustTokens[currentPlatform];

    if (!token) return; // プラットフォーム向けトークンがない場合は送信しない

    // パラメータを構築
    const adjustParams = buildAdjustParams(eventConfig, parameters);
    trackAdjustEventAsyncCore(token, adjustParams);
  } catch (_error) {
    // Adjustイベント送信は補助的な機能のため、静かに失敗
  }
};

// Adjustパラメータ構築関数
type AdjustParams = {
  callbackParams?: Array<{ key: string; value: string }>;
  partnerParams?: Array<{ key: string; value: string }>;
};

const buildAdjustParams = (
  eventConfig: EventTokenConfig,
  _params?: GA4EventParameters,
): AdjustParams | undefined => {
  const ga4Key = eventConfig[EventProvider.GA4];

  switch (ga4Key) {
    case EVENT_NAMES.sign_up:
    case EVENT_NAMES.edit_profile:
    case EVENT_NAMES.COMPLETE_BUY_IMAGE:
    case EVENT_NAMES.COMPLETE_BUY_VIDEO:
    case EVENT_NAMES.COMPLETE_SEND_MESSAGE:
    case EVENT_NAMES.COMPLETE_SEND_BOARD_MESSAGE:
    case EVENT_NAMES.SEND_GOOD:
    case EVENT_NAMES.START_VIDEO_CALL:
    case EVENT_NAMES.START_VOICE_CALL:
    case EVENT_NAMES.START_VIDEO_CHAT:
      // 現状は追加パラメータなし
      return undefined;
    default:
      return undefined;
  }
};

/**
 * Reproイベント送信のヘルパー関数（内部用）
 * @param eventName 送信するイベント名
 * @param parameters イベントパラメータ
 */
const sendReproEvent = (
  eventName: string,
  parameters?: ReproEventParameters,
) => {
  if (isNativeApplication()) {
    // ネイティブアプリにpostMessageで送信
    sendMessageToWebView({
      type: 'REPRO_TRACK',
      payload: { event: eventName, props: parameters ?? {} },
    });
  } else if (typeof window.reproio === 'function') {
    // Web版は従来通りReproに直接送信
    if (parameters) {
      window.reproio('track', eventName, parameters);
    } else {
      window.reproio('track', eventName);
    }
  }
};

/**
 * reproioイベントを非同期で送信する
 * ページレンダリングをブロックしないようにsetTimeoutを使用
 * sourceパラメータがある場合は、以下の2つのイベントを送信：
 * 1. sourceなしイベント（全体集計用）
 * 2. source付きイベント（詳細導線分析用）
 */
export const trackReproEventAsync = (
  eventName: keyof typeof event,
  parameters?: ReproEventParameters,
) => {
  if (!isGAEnabled) return;

  const executeTracking = () => {
    const eventConfig = event[eventName];
    // Repro用のイベント名を取得（文字列）
    const reproEventName = eventConfig[EventProvider.Repro];
    if (!reproEventName) return;

    const source = parameters?.source;

    // sourceがある場合は2つのイベントを送信
    if (typeof source === 'string' && source) {
      // 1. sourceなしイベント（全体集計用）
      sendReproEvent(reproEventName, parameters);

      // 2. source付きイベント（詳細導線分析用）
      const eventNameWithSource = `${reproEventName}_${source}`;
      sendReproEvent(eventNameWithSource, parameters);
    } else {
      // sourceがない場合は従来通り1つのイベントを送信
      sendReproEvent(reproEventName, parameters);
    }
  };

  // 確実に実行するためsetTimeoutを使用
  setTimeout(executeTracking, 0);
};

/**
 * GA4のイベントを非同期で送信する
 * ページレンダリングをブロックしないようにsetTimeoutを使用
 * @param eventName イベント名
 * @param parameters オプショナルなイベントパラメータ
 */
export const trackAnalyticsEventAsync = (
  eventName: keyof typeof event | string,
  parameters?: GA4EventParameters,
) => {
  if (!isGAEnabled || window === undefined) {
    return;
  }

  const executeTracking = () => {
    // eventNameが文字列の場合はそのまま使用、keyの場合は値に変換
    const actualEventName =
      typeof eventName === 'string'
        ? eventName
        : event[eventName as keyof typeof event];

    if (window?.gtag) {
      if (parameters && Object.keys(parameters).length > 0) {
        window.gtag('event', actualEventName, {
          ...parameters,
          debug_mode: true,
        });
      } else {
        window.gtag('event', actualEventName);
      }
    }
  };

  // 確実に実行するためsetTimeoutを使用
  setTimeout(executeTracking, 0);
};
