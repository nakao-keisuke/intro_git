import type { NativeApplicationId } from '@/constants/applicationId';

export type PermissionTarget = 'camera' | 'microphone' | 'notification';
export type MediaPermissionTarget = Exclude<PermissionTarget, 'notification'>;
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export type AuthInfo = {
  email: string;
  pwd: string;
  userId: string;
  token: string;
  /** クライアントから送信されるapplicationId（72: Renka iOS, 76: Renka Android, 83: Hikari iOS, 84: Sakura iOS, 85: Sumire iOS） */
  applicationId?: NativeApplicationId;
};

export type DeviceInfo = {
  deviceName: string | null;
  modelName: string | null;
  osName: string | null;
  osVersion: string | null;
  locale: string;
  timezone: string;
  appVersion: string | null;
  buildVersion: string | null;
  /** iOS IDFV (Identifier for Vendor) */
  idfv?: string;
};

export type UpdateDeviceTokenResult = {
  success: boolean;
  platform: 'ios' | 'android';
  deviceToken?: string;
  error?: string;
};

/**
 * DEVICE_CHECK用のレスポンス型
 * プラットフォームごとに返却される値が異なる
 */
export type DeviceCheckResult =
  | {
      platform: 'ios';
      /** iOS DeviceCheck token */
      device_token: string;
      /** IDFA (Identifier for Advertisers) */
      idfa: string;
    }
  | {
      platform: 'android';
      /** Android Original ID (ANDROID_ID) */
      android_original_id: string;
      /** Google Advertising ID */
      gps_adid: string;
    };

type NativeResult<T> = {
  result: T | null;
  error: Error | null;
};

type PermissionResult = {
  target: PermissionTarget;
  status: PermissionStatus;
};

// 新しいイベント追加手順:
// 1. ここに型を追加
// 2. NativeBridgeListener.tsx の switch に case 追加
type NativeEventMap = {
  purchaseCompleted: CustomEvent<
    { productId?: string; packageId?: string; price?: number } | undefined
  >;
  checkPermissionResult: CustomEvent<PermissionResult>;
  requestPermissionResult: CustomEvent<PermissionResult>;
  authInfoResult: CustomEvent<AuthInfo | null>;
  deviceInfoResult: CustomEvent<DeviceInfo>;
  updateDeviceTokenResult: CustomEvent<UpdateDeviceTokenResult>;
  deviceCheckResult: CustomEvent<DeviceCheckResult>;
};

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

const DEFAULT_TIMEOUT = 10000;

const send = <T>(
  type: string,
  payload?: unknown,
  responseEvent?: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<NativeResult<T>> => {
  return new Promise((resolve) => {
    if (!window.ReactNativeWebView) {
      resolve({ result: null, error: new Error('Not in WebView') });
      return;
    }

    if (!responseEvent) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
      resolve({ result: null, error: null });
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener(responseEvent, handler);
      resolve({ result: null, error: new Error('Request timeout') });
    }, timeout);

    const handler = ((e: CustomEvent) => {
      clearTimeout(timeoutId);
      window.removeEventListener(responseEvent, handler);
      resolve({ result: e.detail as T, error: null });
    }) as EventListener;
    window.addEventListener(responseEvent, handler);
    window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
  });
};

export const native = {
  isInWebView: () =>
    typeof window !== 'undefined' && !!window.ReactNativeWebView,

  checkPermission: (target: PermissionTarget) =>
    send<PermissionResult>(
      'CHECK_PERMISSION',
      { target },
      'checkPermissionResult',
    ),

  requestPermission: (target: PermissionTarget) =>
    send<PermissionResult>(
      'REQUEST_PERMISSION',
      { target },
      'requestPermissionResult',
    ),

  openAppSettings: () => send('OPEN_APP_SETTINGS'),

  requestAppReview: () => send('REQUEST_APP_REVIEW'),

  deleteKeychain: () => send('DELETE_KEYCHAIN'),

  requestDeviceInfo: () =>
    send<DeviceInfo>('REQUEST_DEVICE_INFO', undefined, 'deviceInfoResult'),

  requestAuthInfo: () =>
    send<AuthInfo | null>('REQUEST_AUTH_INFO', undefined, 'authInfoResult'),

  updateDeviceToken: () =>
    send<UpdateDeviceTokenResult>(
      'UPDATE_DEVICE_TOKEN',
      undefined,
      'updateDeviceTokenResult',
    ),

  /**
   * デバイスチェック用ID取得（DEVICE_CHECK）
   *
   * Native側の実装:
   * - DEVICE_CHECK メッセージを受信
   * - iOS: device_token, idfa を取得
   * - Android: android_original_id, gps_adid を取得
   * - deviceCheckResult イベントで結果を返す
   */
  getDeviceCheck: () =>
    send<DeviceCheckResult>('DEVICE_CHECK', undefined, 'deviceCheckResult'),

  /**
   * ネイティブ課金フローを起動（Apple Pay / Google Play）
   * ページ遷移せずに postMessage で課金リクエストを送信する
   * 購入完了後は purchaseCompleted イベントがネイティブから発火される
   */
  startPurchase: (packageId: string) => send('START_PURCHASE', { packageId }),

  isPermissionGranted: async (target: PermissionTarget): Promise<boolean> => {
    const { result } = await native.checkPermission(target);
    return result?.status === 'granted';
  },

  /**
   * ネイティブからデバイス情報を取得し、idfv と lang を返す
   * idfv の優先順位: requestDeviceInfo().idfv → URLパラメータの idfv
   * WebView外またはエラー時は lang = navigator.language にフォールバック
   */
  getDeviceLangAndIdfv: async (): Promise<{
    lang: string;
    idfv: string | undefined;
  }> => {
    const idfvFromUrl =
      typeof window !== 'undefined'
        ? (new URLSearchParams(window.location.search).get('idfv') ?? undefined)
        : undefined;

    if (!native.isInWebView()) {
      return { lang: navigator.language.slice(0, 2), idfv: idfvFromUrl };
    }
    const { result, error } = await native.requestDeviceInfo();
    if (error || !result) {
      return { lang: navigator.language.slice(0, 2), idfv: idfvFromUrl };
    }
    return {
      lang: (result.locale || navigator.language).slice(0, 2),
      idfv: result.idfv || idfvFromUrl,
    };
  },

  once: <K extends keyof NativeEventMap>(
    type: K,
    listener: (event: NativeEventMap[K]) => void,
  ): (() => void) => {
    const handler = ((e: Event) => {
      window.removeEventListener(type, handler);
      listener(e as NativeEventMap[K]);
    }) as EventListener;
    window.addEventListener(type, handler);
    return () => window.removeEventListener(type, handler);
  },
};
