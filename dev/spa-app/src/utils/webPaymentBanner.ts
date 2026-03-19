import { isNativeApplication } from '@/constants/applicationId';

/**
 * Web決済バナーの表示条件をチェック
 * Native版ApplicationID (72: iOS / 76: Android) の場合にtrueを返す
 */
export const shouldShowWebPaymentBanner = (): boolean => {
  return isNativeApplication();
};

/**
 * Web決済バナーのリンクURLを生成
 * @param token ユーザーのセッショントークン
 * @returns Alvion決済ページのURL
 */
export const getWebPaymentBannerUrl = (token: string): string | null => {
  const alvionUrl = import.meta.env.VITE_ALVION_URL;
  if (!alvionUrl || !token) {
    return null;
  }
  return `${alvionUrl}/price/renka?sid=${token}`;
};

/**
 * Web決済バナーの画像パス（ホーム、ポイント購入、デイリーボーナス、News用）
 */
export const WEB_PAYMENT_BANNER_IMAGE = '/purchase/web_purchase.webp';

/**
 * Web決済バナーの画像パス（マイページ用）
 */
export const WEB_PAYMENT_BANNER_IMAGE_FOOTER = '/purchase/web_purchase_f.webp';
