declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

import Script from 'next/script';
import { useSession } from '#/hooks/useSession';
import { useEffect, useState } from 'react';
import {
  getApplicationId,
  isNativeApplication,
} from '@/constants/applicationId';
import { isPWA } from '@/libs/isPWA';
import { usePaymentStore } from '@/stores/paymentStore';

// デバッグモードの判定を追加
const isDevelopment = import.meta.env.NODE_ENV === 'development';

// GA4の測定ID
export const MEASURE_ID = import.meta.env.VITE_GOOGLE_MEASURE_ID;
export const FING_CONVERSION_ID = import.meta.env.VITE_FING_CONVERSION_ID;
export const FING_CONVERSION_LABEL =
  import.meta.env.VITE_FING_CONVERSION_LABEL;

// 測定IDが設定されていればGA4を有効化（本番・開発環境問わず）
export const isGAEnabled = MEASURE_ID !== '';

// 本番環境かどうかの判定（従来の互換性のため残す）
export const isProduction = !isDevelopment;

// ユーザーIDを設定する関数（PageRouter版との互換性のため）
export const setGoogleAnalyticsUserId = (userId: string) => {
  if (isGAEnabled && typeof window !== 'undefined' && window.gtag && userId) {
    const config: Record<string, any> = {
      user_id: userId,
    };

    // 開発環境ではdebug_modeを有効化
    if (isDevelopment) {
      config.debug_mode = true;
    }

    window.gtag('config', MEASURE_ID, config);
  }
};

export default function AppRouterGoogleAnalytics() {
  const { data: session, status } = useSession();
  // Zustandの値を直接参照
  const canQuickCharge = usePaymentStore((s) => s.canQuickCharge);
  const paymentCustomer = usePaymentStore((s) => s.customerData);
  // tokenがあり、かつpaymentCustomerがまだ取得されていない場合はローディング中
  const isLoadingPaymentData = Boolean(
    session?.user?.token && paymentCustomer === null,
  );

  // applicationIdの初期化を待ち、GA4を読み込むかどうかを判定
  const [shouldLoadGA, setShouldLoadGA] = useState<boolean | null>(null);

  // applicationIdをチェックして、GA4を読み込むかどうかを判定
  useEffect(() => {
    const checkApplicationId = () => {
      // iOS (72) または Android (76) の場合はGA4を読み込まない
      setShouldLoadGA(!isNativeApplication());
    };

    // 初回チェック
    checkApplicationId();

    // サーバーサイドでは何もしない
    if (typeof window === 'undefined') return;

    // URLの変化を監視
    const handleUrlState = () => {
      checkApplicationId();
    };

    // localStorageの変化を監視（他のタブでの変更を検知）
    const handleStorageChange = () => {
      checkApplicationId();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('popstate', handleUrlState);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popstate', handleUrlState);
    };
  }, []);

  // useEffect: API取得完了後に一度だけconfig送信
  useEffect(() => {
    if (status === 'loading') return;
    if (!MEASURE_ID) return;
    if (shouldLoadGA === null) return;
    if (!shouldLoadGA) return;

    const userId = session?.user?.id;
    // ログインユーザーの場合、決済情報のロード完了を待つ
    if (userId && isLoadingPaymentData) return;
    // PWA判定
    const isPWAMode = typeof window !== 'undefined' && isPWA();
    // application_id取得（15: Web, 72: Native iOS, 76: Native Android）
    const applicationId = getApplicationId();
    if (typeof window !== 'undefined' && window.gtag) {
      const config: Record<string, any> = {
        user_properties: {
          is_pwa: isPWAMode ? 'true' : 'false',
          application_id: applicationId,
          has_credit_card: userId
            ? canQuickCharge
              ? 'true'
              : 'false'
            : 'false',
        },
        debug_mode: isDevelopment,
      };

      // ログインユーザーの場合はuser_idを追加
      if (userId) {
        config.user_id = userId;
      }
      window.gtag('config', MEASURE_ID, config);
    }
  }, [
    status,
    session?.user?.id,
    canQuickCharge,
    shouldLoadGA,
    isLoadingPaymentData,
  ]);

  if (shouldLoadGA === null) return null;

  // Native版（applicationId: 72, 76）の場合はGA4スクリプトを読み込まない
  if (!shouldLoadGA) return null;

  if (!MEASURE_ID) return null;

  return (
    <>
      <Script
        id="ga-loader"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASURE_ID}`}
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){ dataLayer.push(arguments); }
              gtag('js', new Date());

              // window.gtagをグローバルに定義
              window.gtag = gtag;

              // Fing広告測定IDの設定
              const fingConversionId = '${FING_CONVERSION_ID}';
              if (fingConversionId) {
                gtag('config', fingConversionId);
              }

              // 開発環境では全てのイベントにdebug_modeを自動追加するようgtagをラップ
              const isDev = ${isDevelopment};
              if (isDev) {
                const originalGtag = gtag;
                window.gtag = function() {
                  const args = Array.from(arguments);
                  // eventコマンドの場合、3番目の引数（パラメータ）にdebug_modeを追加
                  if (args[0] === 'event' && args[2]) {
                    args[2].debug_mode = true;
                  } else if (args[0] === 'event' && !args[2]) {
                    args[2] = { debug_mode: true };
                  }
                  return originalGtag.apply(this, args);
                };
              }
            `,
        }}
      />
    </>
  );
}
