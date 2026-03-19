// イベント送信用のキューとラッパー関数
import { getSession } from 'next-auth/react';
import { isNativeApplication } from '@/constants/applicationId';
import { isKeyEvent } from '@/constants/ga4Event';
import { getGclid } from './gclid';
import { getGoogleClientId } from './googleClientId';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

type GtagCommand = 'config' | 'event';

const isDevelopment = import.meta.env.NODE_ENV === 'development';

// Fing広告コンバージョン送信先（send_to）
// フィアル内定義: 環境変数は使用しない
export const PURCHASE_CONVERSION_SEND_TO =
  'AW-17652935649/aK73CMiv0tIbEOHXyeFB';

// GA4イベント送信ログを記録
async function logGA4Event(
  success: boolean,
  message: string,
  eventName: string,
  params: Record<string, any>,
  userId: string,
) {
  try {
    await fetch('/api/log/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: success,
        eventName: eventName,
        userId: userId,
        message: message,
        params: params,
      }),
    });
  } catch (logError) {
    console.error('Failed to send GA4 log:', logError);
  }
}

/**
 * Fing広告コンバージョンイベントを送信
 * 本番環境のみ送信し、開発環境ではスキップ
 * @param userId ユーザーID
 * @returns Promise<void>
 */
export async function sendFingConversion(userId?: string): Promise<void> {
  // 開発環境ではスキップ
  if (isDevelopment) {
    console.warn('[Dev] Fing広告コンバージョン送信をスキップ');
    return;
  }

  // userIdが存在しない場合はスキップ
  if (!userId) {
    console.warn('Fing Conversion: userId is undefined, skipping');
    return;
  }

  const conversionId = import.meta.env.VITE_FING_CONVERSION_ID;
  const conversionLabel = import.meta.env.VITE_FING_CONVERSION_LABEL;

  if (!conversionId || !conversionLabel) {
    console.warn('Fing広告設定が見つかりません');
    return;
  }

  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: `${conversionId}/${conversionLabel}`,
        user_id: userId,
      });

      // GA4イベントログに記録
      await logGA4Event(
        true,
        'Fing conversion sent successfully',
        'conversion',
        { send_to: `${conversionId}/${conversionLabel}` },
        userId,
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    await logGA4Event(
      false,
      errorMessage,
      'conversion',
      { send_to: `${conversionId}/${conversionLabel}` },
      userId,
    );
  }
}

/**
 * Fing広告: 購入コンバージョンを送信（value/transaction_idを動的指定）
 */
export async function sendFingPurchaseConversion(params: {
  value: number;
  transactionId: string;
}): Promise<void> {
  try {
    // Renka（iOS: 72, Android: 76）の場合は送信しない（Webのみ）
    if (isNativeApplication()) return;

    if (typeof window === 'undefined' || !window.gtag) return;

    const { value, transactionId } = params;
    window.gtag('event', 'conversion', {
      send_to: PURCHASE_CONVERSION_SEND_TO,
      value,
      currency: 'JPY',
      transaction_id: transactionId,
    });
  } catch (error) {
    const session = await getSession().catch(() => null);
    const userId = session?.user?.id || 'guest';
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    await logGA4Event(
      false,
      errorMessage,
      'conversion',
      { send_to: PURCHASE_CONVERSION_SEND_TO },
      userId,
    );
  }
}

// ga4にイベントを送信
export async function sendGA4ClientEvent(
  command: GtagCommand,
  name: string,
  params: Record<string, any> = {},
) {
  try {
    // Renka（iOS: 72, Android: 76）の場合は送信しない
    if (isNativeApplication()) return;

    // セッションからuserIdを取得
    const session = await getSession();
    // UserIdが取れない場合はguestを設定
    const userId = session?.user?.id || 'guest';

    // KeyEventの場合、gclid と client_id を付与
    let keyEventParams: Record<string, string> = {};
    if (isKeyEvent(name)) {
      const gclid = getGclid();
      const clientId = getGoogleClientId();
      keyEventParams = {
        ...(gclid && { gclid }),
        ...(clientId && { client_id: clientId }),
      };
    }

    const _params = {
      ...params,
      ...keyEventParams,
      user_id: userId,
      debug_mode: isDevelopment,
    };

    // ブラウザ環境でのみ実行
    if (typeof window !== 'undefined') {
      // window.dataLayerが存在しない場合は初期化
      if (!window.dataLayer) {
        window.dataLayer = [];
      }

      // window.gtagが存在しない場合は定義
      if (!window.gtag) {
        window.gtag = function () {
          window.dataLayer?.push(arguments);
        };
      }

      // GA4イベント送信
      window.gtag(command, name, _params);
      await logGA4Event(
        true,
        'GA4 event sent successfully',
        name,
        params,
        userId,
      );
    } else {
      await logGA4Event(false, 'window is not available', name, params, userId);
    }
  } catch (error) {
    // 送信失敗ログ
    const session = await getSession().catch(() => null);
    const userId = session?.user?.id || 'guest';
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    await logGA4Event(false, errorMessage, name, params, userId);
  }
}
