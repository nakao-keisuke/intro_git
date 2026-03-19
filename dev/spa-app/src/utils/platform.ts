import { APPLICATION_ID, getApplicationId } from '@/constants/applicationId';
import { AdjustPlatform } from '@/constants/eventProviders';
import { isAndroid } from '@/utils/deviceDetection';

/**
 * 現在のAdjustプラットフォームを取得
 *
 * 判定優先順位:
 * 1. localStorage の applicationId で各アプリを識別
 * 2. フォールバック: localStorage未設定かつWeb版でAndroid UserAgentの場合のみAndroid判定
 * 3. デフォルト: 上記以外はすべてRenkaIos（計測の正確性を保つため）
 */
export const getCurrentAdjustPlatform = (): AdjustPlatform => {
  try {
    const appId = getApplicationId();

    if (appId === APPLICATION_ID.NATIVE_ANDROID) {
      return AdjustPlatform.RenkaAndroid;
    }
    if (appId === APPLICATION_ID.HIKARI_IOS) {
      return AdjustPlatform.HikariIos;
    }
    if (appId === APPLICATION_ID.SAKURA_IOS) {
      return AdjustPlatform.SakuraIos;
    }
    if (appId === APPLICATION_ID.SUMIRE_IOS) {
      return AdjustPlatform.SumireIos;
    }

    // localStorageにapplicationIdがない場合のフォールバック
    if (appId === APPLICATION_ID.WEB && isAndroid()) {
      return AdjustPlatform.RenkaAndroid;
    }

    return AdjustPlatform.RenkaIos;
  } catch (_error) {
    return AdjustPlatform.RenkaIos;
  }
};
