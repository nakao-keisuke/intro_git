import axios from 'axios';
import { isNativeApplication } from '@/constants/applicationId';
import { isKeyEvent } from '@/constants/ga4Event';
import type { PaymentMethod } from '@/types/payment';
import {
  getPurchaseInfoByAmount,
  type PurchaseType,
} from '@/utils/purchaseUtils';

/**
 * GA4イベントパラメーター型
 */
export type GA4EventParams = {
  [key: string]:
    | string
    | number
    | boolean
    | unknown[]
    | Record<string, unknown>;
};

/**
 * GA4サーバーイベント送信オプション
 */
export type SendGA4ServerEventOptions = {
  clientId: string; // クライアントID（必須）
  eventName: string; // イベント名（例: 'sign_up', 'purchase'）
  eventParams?: GA4EventParams; // イベントパラメーター
  gclid?: string; // Google Click ID（KeyEventの場合に使用）
};

/**
 * サーバーサイドからGA4にイベントを送信
 *
 * @param options - イベント送信オプション
 * @returns 送信成功時true、失敗時false
 *
 * @example
 * ```typescript
 * await sendGA4ServerEvent({
 *   clientId: 'GA1.1.123456789.1234567890',
 *   eventName: 'sign_up',
 *   eventParams: {
 *     register_type: 'google',
 *     cm_code: 'campaign_001',
 *   }
 * });
 * ```
 */
export async function sendGA4ServerEvent({
  clientId,
  eventName,
  eventParams = {},
  gclid,
}: SendGA4ServerEventOptions): Promise<boolean> {
  // renka (applicationId: 72) の場合、GA4イベントを送信しない
  if (isNativeApplication()) {
    return false;
  }

  try {
    // サーバー専用環境変数を使用
    const measurementId = import.meta.env.VITE_GOOGLE_MEASURE_ID;
    const apiSecret = import.meta.env.VITE_GA_API_SECRET;

    // 環境変数チェック
    if (!measurementId || !apiSecret) {
      console.error('[GA4 Server] 環境変数が不足しています', {
        hasMeasurementId: !!measurementId,
        hasApiSecret: !!apiSecret,
      });
      return false;
    }

    // KeyEventの場合、gclid と client_id をイベントパラメータに付与
    const keyEventParams = isKeyEvent(eventName)
      ? {
          ...(gclid && { gclid }),
          client_id: clientId,
        }
      : {};

    // GA4 Measurement Protocol ペイロード作成
    const payload = {
      client_id: clientId,
      events: [
        {
          name: eventName,
          params: {
            ...eventParams,
            ...keyEventParams,
            // エンゲージメント時間（必須）
            engagement_time_msec: eventParams.engagement_time_msec || 1,
            // デバッグモード（開発環境のみ）
            ...(import.meta.env.NODE_ENV === 'development' && { debug_mode: true }),
          },
        },
      ],
    };

    // 開発環境では検証エンドポイントを使用、本番環境では通常エンドポイントを使用
    const isDevelopment = import.meta.env.NODE_ENV === 'development';
    const endpoint = isDevelopment
      ? `https://www.google-analytics.com/debug/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`
      : `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

    // GA4 Measurement Protocol APIへ送信
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5秒タイムアウト
    });

    // レスポンスログ出力
    if (isDevelopment) {
      console.log('[GA4 Server] Validation Response:', {
        status: response.status,
        statusText: response.statusText,
        validationMessages: response.data,
      });
    }

    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error('[GA4 Server] イベント送信エラー:', error);
    return false;
  }
}

/**
 * サーバーサイドからGA4にpurchaseイベントを送信
 *
 * @param purchaseData - 購入データ
 * @returns 送信成功時true、失敗時false
 *
 * @example
 * ```typescript
 * await sendGA4ServerPurchaseEvent({
 *   transactionId: 'T_2900_2000_1234567890',
 *   amount: 2900,
 *   point: 2000,
 *   userId: 'user_123',
 *   purchaseType: PurchaseType.NORMAL,
 *   paymentMethod: PaymentMethod.CREDIT,
 *   clientId: 'GA1.1.123456789.1234567890',
 * });
 * ```
 */
export async function sendGA4ServerPurchaseEvent(purchaseData: {
  transactionId: string;
  amount: number;
  point: number;
  userId: string;
  purchaseType: PurchaseType;
  paymentMethod: PaymentMethod;
  clientId?: string;
  gclid?: string;
  source?: string;
}): Promise<boolean> {
  // renka (applicationId: 72) の場合、GA4イベントを送信しない
  if (isNativeApplication()) {
    return false;
  }

  try {
    // purchaseUtilsの既存ロジックを参考にパラメータ作成
    const purchaseInfo = getPurchaseInfoByAmount(
      purchaseData.amount,
      purchaseData.point,
    );
    if (!purchaseInfo) {
      console.error('[GA4 Server Purchase] 購入情報が見つかりません', {
        amount: purchaseData.amount,
        point: purchaseData.point,
      });
      return false;
    }

    const params: GA4EventParams = {
      transaction_id: purchaseData.transactionId,
      value: purchaseData.amount,
      currency: 'JPY',
      items: [
        {
          item_id: purchaseInfo.itemId,
          item_name: purchaseInfo.courseName,
          price: purchaseData.amount,
          quantity: 1,
          item_category: 'ポイント購入',
        },
      ],
      purchase_type: purchaseData.purchaseType,
      payment_method: purchaseData.paymentMethod,
      user_id: purchaseData.userId,
      ...(purchaseData.gclid && { gclid: purchaseData.gclid }),
      ...(purchaseData.source && { source: purchaseData.source }),
    };

    // 既存のsendGA4ServerEvent関数を使用
    return await sendGA4ServerEvent({
      clientId: purchaseData.clientId || `server-${Date.now()}`, // フォールバック
      eventName: 'purchase',
      eventParams: params,
    });
  } catch (error) {
    console.error('[GA4 Server Purchase] イベント送信エラー:', error);
    return false;
  }
}
