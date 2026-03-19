import { native } from '@/libs/nativeBridge';
import { isAndroid } from '@/utils/deviceDetection';

export const APPLICATION_ID = {
  WEB: '15',
  NATIVE: '72', // Renka iOS
  NATIVE_ANDROID: '76', // Renka Android
  HIKARI_IOS: '83', // Hikari iOS
  SAKURA_IOS: '84', // Sakura iOS
  SUMIRE_IOS: '85', // Sumire iOS
} as const;

/** Native版ログインページのパス */
export const NATIVE_LOGIN_PATH = '/login?app=native';

export type ApplicationIdType =
  (typeof APPLICATION_ID)[keyof typeof APPLICATION_ID];

/** Native版applicationId（Renka iOS: 72, Renka Android: 76, Hikari iOS: 83, Sakura iOS: 84, Sumire iOS: 85） */
export type NativeApplicationId =
  | typeof APPLICATION_ID.NATIVE
  | typeof APPLICATION_ID.NATIVE_ANDROID
  | typeof APPLICATION_ID.HIKARI_IOS
  | typeof APPLICATION_ID.SAKURA_IOS
  | typeof APPLICATION_ID.SUMIRE_IOS;

export const APPLICATION_ID_STORAGE_KEY = 'applicationId';

/**
 * URLパラメータから現在のapplicationIdがネイティブ版かどうかを判定
 * @private
 */
const isNativeFromUrlParams = (): boolean => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('app') === 'native';
};

/**
 * applicationIdが初期化済みかどうかを確認
 */
export const isApplicationIdInitialized = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    (localStorage.getItem(APPLICATION_ID_STORAGE_KEY) !== null ||
      isNativeFromUrlParams())
  );
};

/** 有効なapplicationIdのホワイトリスト */
const VALID_APPLICATION_IDS: readonly string[] = Object.values(APPLICATION_ID);

/**
 * applicationIdを取得
 * 優先順位: URLパラメータ(?app=native&appId=XX) > localStorage > デフォルト(15)
 * - ?app=native かつ ?appId=XX が存在する場合: appIdを優先使用（Hikari/Sakura/Sumire向け）
 * - ?app=native のみの場合: User-AgentでiOS/Android判定（Renka向け既存挙動）
 * - 不正な値が保存されている場合もデフォルト値を返す
 */
export const getApplicationId = (): ApplicationIdType => {
  if (typeof window === 'undefined') return APPLICATION_ID.WEB;

  // URLパラメータをチェック（?app=native）
  if (isNativeFromUrlParams()) {
    const urlParams = new URLSearchParams(window.location.search);
    // ?appId=83/84/85 が明示されている場合は優先使用（Hikari/Sakura/Sumire）
    const explicitId = urlParams.get('appId');
    if (
      explicitId &&
      VALID_APPLICATION_IDS.includes(explicitId) &&
      explicitId !== APPLICATION_ID.WEB
    ) {
      localStorage.setItem(APPLICATION_ID_STORAGE_KEY, explicitId);
      return explicitId as ApplicationIdType;
    }
    // ?appId 未指定: User-AgentでiOS/Android判定（Renka既存挙動）
    const appId = isAndroid()
      ? APPLICATION_ID.NATIVE_ANDROID
      : APPLICATION_ID.NATIVE;
    localStorage.setItem(APPLICATION_ID_STORAGE_KEY, appId);
    return appId;
  }

  // localStorageをチェック
  const stored = localStorage.getItem(APPLICATION_ID_STORAGE_KEY);
  if (stored && VALID_APPLICATION_IDS.includes(stored)) {
    return stored as ApplicationIdType;
  }
  return APPLICATION_ID.WEB;
};

/**
 * localStorageにapplicationIdを保存
 * @param id - 設定するapplicationId（'15': Web版, '72': Native iOS版, '76': Native Android版）
 */
export const setApplicationId = (id: ApplicationIdType): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(APPLICATION_ID_STORAGE_KEY, id);
  }
};

/**
 * 現在のapplicationIdがネイティブ版かどうか
 * Renka iOS (72), Renka Android (76), Hikari iOS (83), Sakura iOS (84), Sumire iOS (85) の場合にtrueを返す
 */
export const isNativeApplication = (): boolean => {
  const appId = getApplicationId();
  return (
    appId === APPLICATION_ID.NATIVE ||
    appId === APPLICATION_ID.NATIVE_ANDROID ||
    appId === APPLICATION_ID.HIKARI_IOS ||
    appId === APPLICATION_ID.SAKURA_IOS ||
    appId === APPLICATION_ID.SUMIRE_IOS
  );
};

/**
 * User-Agentに基づいて適切なNative版applicationIdを取得
 * iOS: 72, Android: 76
 * DeviceInfo取得失敗時のフォールバックとして使用
 */
export const getNativeApplicationIdFromUserAgent = (): '72' | '76' => {
  return isAndroid() ? APPLICATION_ID.NATIVE_ANDROID : APPLICATION_ID.NATIVE;
};

/**
 * DeviceInfoのosNameに基づいてNative版applicationIdを取得（非同期）
 * WebViewからDeviceInfoを取得してAndroid判定を行う
 * User-Agent検出より確実な判定方法
 * 取得失敗時はUser-Agentベースの判定にフォールバック
 *
 * @returns '72' (iOS) | '76' (Android)
 */
export const getNativeApplicationIdFromDeviceInfo = async (): Promise<
  '72' | '76'
> => {
  if (!native.isInWebView()) {
    // WebView外からの呼び出し時はUser-Agentベースで判定
    return getNativeApplicationIdFromUserAgent();
  }

  try {
    const { result, error } = await native.requestDeviceInfo();

    if (error || !result) {
      // DeviceInfo取得失敗時はUser-Agentベースで判定
      return getNativeApplicationIdFromUserAgent();
    }

    const isAndroidDevice = result.osName?.toLowerCase() === 'android';
    return isAndroidDevice
      ? APPLICATION_ID.NATIVE_ANDROID
      : APPLICATION_ID.NATIVE;
  } catch {
    // エラー時はUser-Agentベースで判定
    return getNativeApplicationIdFromUserAgent();
  }
};
