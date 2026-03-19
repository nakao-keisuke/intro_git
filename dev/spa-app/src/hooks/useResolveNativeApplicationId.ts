import { useCallback } from 'react';
import {
  APPLICATION_ID,
  getNativeApplicationIdFromDeviceInfo,
  getNativeApplicationIdFromUserAgent,
  type NativeApplicationId,
} from '@/constants/applicationId';
import { native } from '@/libs/nativeBridge';

const VALID_NATIVE_APPLICATION_IDS: string[] = [
  APPLICATION_ID.NATIVE,
  APPLICATION_ID.NATIVE_ANDROID,
  APPLICATION_ID.HIKARI_IOS,
  APPLICATION_ID.SAKURA_IOS,
  APPLICATION_ID.SUMIRE_IOS,
];

/**
 * Native版applicationIdを解決する関数を返すフック
 * 解決優先順位:
 *   0. URLパラメータの appId（Hikari/Sakura/Sumire向け: 83/84/85）
 *   1. requestAuthInfo().applicationId
 *   2. getNativeApplicationIdFromDeviceInfo()（内部でrequestDeviceInfo → User-Agentフォールバック）
 */
export const useResolveNativeApplicationId = () => {
  return useCallback(async (): Promise<NativeApplicationId> => {
    // 0. URLパラメータの appId を最優先チェック（Hikari/Sakura/Sumire向け）
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const explicitAppId = urlParams.get('appId');
      if (
        explicitAppId &&
        VALID_NATIVE_APPLICATION_IDS.includes(explicitAppId)
      ) {
        return explicitAppId as NativeApplicationId;
      }
    }

    if (!native.isInWebView()) {
      return getNativeApplicationIdFromUserAgent();
    }

    // 1. requestAuthInfoからapplicationIdを取得（ネイティブが返してくれれば最速）
    try {
      const { result, error } = await native.requestAuthInfo();
      if (!error && result?.applicationId) {
        return result.applicationId;
      }
    } catch {
      // fall through
    }

    // 2. DeviceInfoのosNameで判定（authInfoが取れない場合のフォールバック）
    return getNativeApplicationIdFromDeviceInfo();
  }, []);
};
