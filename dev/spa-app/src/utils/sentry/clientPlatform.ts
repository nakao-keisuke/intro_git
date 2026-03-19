import {
  APPLICATION_ID,
  APPLICATION_ID_STORAGE_KEY,
} from '@/constants/applicationId';
import { native } from '@/libs/nativeBridge';
import { isAndroid } from '@/utils/deviceDetection';

export type ClientPlatform = 'web' | 'ios' | 'android';

type ClientPlatformRetryOptions = {
  timeoutMs?: number;
  intervalMs?: number;
};

const isNativeFromUrlParams = (): boolean => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('app') === 'native';
};

const getStoredApplicationId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(APPLICATION_ID_STORAGE_KEY);
};

const mapApplicationIdToClient = (applicationId: string): ClientPlatform => {
  if (applicationId === APPLICATION_ID.NATIVE_ANDROID) return 'android';
  if (
    applicationId === APPLICATION_ID.NATIVE ||
    applicationId === APPLICATION_ID.HIKARI_IOS ||
    applicationId === APPLICATION_ID.SAKURA_IOS ||
    applicationId === APPLICATION_ID.SUMIRE_IOS
  )
    return 'ios';
  return 'web';
};

const fallbackFromWebView = (): ClientPlatform => {
  if (!native.isInWebView()) return 'web';
  return isAndroid() ? 'android' : 'ios';
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const getClientPlatformSync = (): ClientPlatform => {
  const applicationId = getStoredApplicationId();
  if (applicationId) {
    return mapApplicationIdToClient(applicationId);
  }

  if (isNativeFromUrlParams()) {
    return isAndroid() ? 'android' : 'ios';
  }

  return fallbackFromWebView();
};

export const getClientPlatformWithRetry = async (
  options: ClientPlatformRetryOptions = {},
): Promise<ClientPlatform> => {
  const { timeoutMs = 5000, intervalMs = 1000 } = options;

  const initialApplicationId = getStoredApplicationId();
  if (initialApplicationId) {
    return mapApplicationIdToClient(initialApplicationId);
  }

  if (isNativeFromUrlParams()) {
    return isAndroid() ? 'android' : 'ios';
  }

  if (typeof window === 'undefined') {
    return 'web';
  }

  const startAt = Date.now();
  while (Date.now() - startAt < timeoutMs) {
    await delay(intervalMs);
    const applicationId = getStoredApplicationId();
    if (applicationId) {
      return mapApplicationIdToClient(applicationId);
    }
  }

  return fallbackFromWebView();
};

export const setClientPlatformCookie = (client: ClientPlatform): void => {
  if (typeof document === 'undefined') return;
  const maxAgeSeconds = 60 * 60 * 24 * 30;
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API はブラウザサポートが限定的なため使用しない
  document.cookie = `client=${client}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
};
