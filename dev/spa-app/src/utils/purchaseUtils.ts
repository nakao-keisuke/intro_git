import type { PaymentMethod } from '@/types/payment';
import { trackReproEventAsync } from './eventTracker';
import { sendFingPurchaseConversion } from './ga4';
import { getGclid } from './gclid';
import { getGoogleClientIdFromCookie } from './googleClientId';
import {
  clearPurchaseAttribution,
  formatAttributionForSource,
  getPurchaseAttribution,
} from './purchaseAttribution';
import {
  generateTransactionId,
  isTransactionSent,
  markTransactionAsSent,
} from './purchaseDeduplication';
import { trackTikTokPurchase } from './tiktokTracking';

// 購入種類のenum定義
export enum PurchaseType {
  QUICK_CHARGE = 'quick_charge',
  NORMAL = 'normal',
}

// 購入情報の型定義
export type PurchaseInfo = {
  amount: number;
  points: number;
  courseName: string;
  itemId: string;
};

// Repro購入イベントパラメータの型定義（フラット構造）
type ReproPurchaseParams = {
  transaction_id: string;
  value: number;
  currency: string;
  item_id: string;
  item_name: string;
  item_price: number;
  item_quantity: number;
  item_category: string;
  purchase_type: string;
  payment_method: string;
  user_id?: string;
  source?: string;
};

// 金額とポイント数から購入情報を取得する関数
export const getPurchaseInfoByAmount = (
  amount: number,
  points: number,
): PurchaseInfo | null => {
  const purchaseInfoMap: {
    [key: string]: PurchaseInfo;
  } = {
    // 通常コース
    '800_550': {
      amount: 800,
      points: 550,
      courseName: '800円コース',
      itemId: 'POINT_800',
    },
    '2900_2000': {
      amount: 2900,
      points: 2000,
      courseName: '2,900円コース',
      itemId: 'POINT_2900',
    },
    '4900_3600': {
      amount: 4900,
      points: 3600,
      courseName: '4,900円コース',
      itemId: 'POINT_4900',
    },
    '10000_8000': {
      amount: 10000,
      points: 8000,
      courseName: '10,000円コース',
      itemId: 'POINT_10000',
    },
    '14900_12000': {
      amount: 14900,
      points: 12000,
      courseName: '14,900円コース',
      itemId: 'POINT_14900',
    },
    // ボーナスコース
    '800_1000': {
      amount: 800,
      points: 1000,
      courseName: '800円ボーナスコース（初回限定75%増量）',
      itemId: 'BONUS_POINT_800',
    },
    '2900_2500': {
      amount: 2900,
      points: 2500,
      courseName: '2,900円ボーナスコース（2回目限定30%おトク）',
      itemId: 'BONUS_POINT_2900',
    },
    '4900_4400': {
      amount: 4900,
      points: 4400,
      courseName: '4,900円ボーナスコース（3回目限定800ptおトク）',
      itemId: 'BONUS_POINT_4900',
    },
    '10000_9000': {
      amount: 10000,
      points: 9000,
      courseName: '10,000円ボーナスコース（4回目限定1000ptおトク）',
      itemId: 'BONUS_POINT_10000',
    },
    '14900_14000': {
      amount: 14900,
      points: 14000,
      courseName: '14,900円ボーナスコース（5回目限定2000ptおトク）',
      itemId: 'BONUS_POINT_14900',
    },
  };

  const combinationKey = `${amount}_${points}`;
  return purchaseInfoMap[combinationKey] || null;
};

// GA4 purchaseイベント用のパラメータを生成する関数
export const createPurchaseEventParams = (
  purchaseInfo: PurchaseInfo,
  purchaseType: PurchaseType,
  transactionId?: string,
) => {
  const params: Record<string, any> = {
    transaction_id: transactionId || `T_${Date.now()}`,
    value: purchaseInfo.amount,
    currency: 'JPY',
    items: [
      {
        item_id: purchaseInfo.itemId,
        item_name: purchaseInfo.courseName,
        price: purchaseInfo.amount,
        quantity: 1,
        item_category: 'ポイント購入',
      },
    ],
    purchase_type: purchaseType,
  };

  // gclidをlocalStorage → Cookieの順で取得
  const gclid = getGclid();
  // gclidが有効な値の場合のみ追加
  if (gclid && gclid.trim() !== '') {
    params.gclid = gclid;
  }

  return params;
};

/**
 * 決済完了時にGA4 purchaseイベントをサーバー経由で送信する共通関数
 * 重複送信を防ぐため、transaction_idベースの送信管理を実装
 * @param amount 決済金額
 * @param point 付与ポイント数
 * @param purchaseType 購入タイプ
 * @param paymentMethod 決済方法
 * @param transactionId トランザクションID（オプション、未指定の場合は自動生成）
 * @param userId ユーザーID（オプション、TikTok Pixel用）
 * @param source 購入導線（オプション、banner/news/bonus等）
 */
export const sendPurchaseEvent = async (
  amount: number,
  point: number,
  purchaseType: PurchaseType,
  paymentMethod: PaymentMethod,
  transactionId?: string,
  userId?: string,
  source?: string,
): Promise<void> => {
  try {
    // トランザクションIDが未指定の場合は生成
    const finalTransactionId =
      transactionId || generateTransactionId(amount, point);

    // 重複チェック: 既に送信済みの場合はスキップ
    if (isTransactionSent(finalTransactionId)) {
      if (import.meta.env.NODE_ENV === 'development') {
        console.log(
          'Purchase event already sent for transaction:',
          finalTransactionId,
        );
      }
      return;
    }

    const purchaseInfo = getPurchaseInfoByAmount(amount, point);

    if (purchaseInfo) {
      // _ga cookieからclientIdを取得
      const clientId = getGoogleClientIdFromCookie();

      // attribution情報を取得してsourceに統合
      const attribution = getPurchaseAttribution();
      const finalSource = attribution
        ? formatAttributionForSource(attribution)
        : source || 'direct'; // 既存のsourceまたはデフォルト値

      // サーバーAPIにGA4イベント送信をリクエスト
      await fetch('/api/purchase/send-ga4-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: finalTransactionId,
          amount,
          point,
          purchaseType,
          paymentMethod,
          clientId,
          source: finalSource, // attribution情報を含む
        }),
      });

      // TikTok Pixel: Purchaseイベント送信（クライアント側から継続）
      await trackTikTokPurchase(userId, purchaseInfo.amount, 'JPY');

      // Fing広告: 購入コンバージョン送信（value/transaction_idを動的指定）
      await sendFingPurchaseConversion({
        value: purchaseInfo.amount,
        transactionId: finalTransactionId,
      });

      // Repro: Purchaseイベント送信（クライアント側）
      // sourceがある場合は、sourceなしとsource付きの2つのイベントを送信
      try {
        const reproParams: ReproPurchaseParams = {
          transaction_id: finalTransactionId,
          value: purchaseInfo.amount,
          currency: 'JPY',
          item_id: purchaseInfo.itemId,
          item_name: purchaseInfo.courseName,
          item_price: purchaseInfo.amount,
          item_quantity: 1,
          item_category: 'ポイント購入',
          purchase_type: purchaseType,
          payment_method: paymentMethod,
          ...(userId && { user_id: userId }),
          source: finalSource,
        };

        // sourceがある場合は2つのイベントを送信
        if (finalSource && finalSource !== 'direct') {
          // 1. sourceなしイベント（全体集計用）
          const { source: _, ...paramsWithoutSource } = reproParams;
          trackReproEventAsync('purchase', paramsWithoutSource);

          // 2. source付きイベント（詳細導線分析用）
          trackReproEventAsync('purchase', reproParams);
        } else {
          // sourceがない、またはdirectの場合は1つのイベントのみ
          trackReproEventAsync('purchase', reproParams);
        }
      } catch (reproError) {
        // Reproイベント送信エラーは決済フローに影響を与えない
        console.error('Repro event sending error:', reproError);
      }

      // 送信成功後にattributionをクリア
      clearPurchaseAttribution();

      // 送信済みとしてマーク（送信成功後）
      markTransactionAsSent(finalTransactionId, amount, point);
    } else {
      console.error('Purchase info not found:', {
        amount,
        point,
        purchaseType,
      });
    }
  } catch (error) {
    // GA4送信エラーは決済フローに影響を与えない
    console.error('GA4 event sending error:', error);
  }
};
