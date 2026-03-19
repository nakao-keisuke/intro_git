import { useSession } from '#/hooks/useSession';
import { useEffect, useRef } from 'react';
import type { PaymentMethod } from '@/types/payment';
import { type PurchaseType, sendPurchaseEvent } from '@/utils/purchaseUtils';

type UsePurchaseEventParams = {
  amount: number;
  point: number;
  purchaseType: PurchaseType;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  source?: string;
  enabled?: boolean; // イベント送信を有効にするかどうか
};

/**
 * 購入イベントを1回だけ送信するカスタムフック
 * **重複防止の仕組み:**
 * 1. session取得を待機してuserIdを確実に送信
 * 2. useRefで同一コンポーネント内での重複を防止
 * 3. transaction_idベースでSessionStorageに送信履歴を記録
 *
 * @param params 購入イベントパラメータ
 * @param params.amount 購入金額
 * @param params.point 付与ポイント数
 * @param params.purchaseType 購入タイプ
 * @param params.paymentMethod 決済方法
 * @param params.transactionId トランザクションID（オプション）
 * @param params.enabled イベント送信を有効にするか（デフォルト: true）
 *
 * @example
 * ```tsx
 * // 購入完了画面で使用
 * usePurchaseEvent({
 *   amount: 2900,
 *   point: 2000,
 *   purchaseType: PurchaseType.NORMAL,
 *   paymentMethod: PaymentMethod.CREDIT,
 *   transactionId: 'T_2900_2000_1234567890_abc123',
 *   enabled: true,
 * });
 * ```
 */
export function usePurchaseEvent({
  amount,
  point,
  purchaseType,
  paymentMethod,
  transactionId,
  source,
  enabled = true,
}: UsePurchaseEventParams) {
  const { data: session } = useSession();
  const hasSentEvent = useRef(false);
  const isExecuting = useRef(false);

  useEffect(() => {
    // 送信が無効、session未取得、既に送信済み、または実行中の場合はスキップ
    if (
      !enabled ||
      !session?.user?.id ||
      hasSentEvent.current ||
      isExecuting.current
    ) {
      return;
    }

    // 実行中フラグを立てる
    isExecuting.current = true;

    const sendEvent = async () => {
      try {
        const userId = session.user.id;

        await sendPurchaseEvent(
          amount,
          point,
          purchaseType,
          paymentMethod,
          transactionId,
          userId,
          source,
        );

        // 送信成功後に送信済みフラグを立てる
        hasSentEvent.current = true;
      } catch (error) {
        console.error('Failed to send purchase event:', error);
      } finally {
        isExecuting.current = false;
      }
    };

    sendEvent();

    // sessionのuser.idが必要なので、session全体ではなくuser.idの変化を監視
  }, [
    amount,
    point,
    purchaseType,
    paymentMethod,
    transactionId,
    source,
    enabled,
    session?.user?.id,
  ]);
}
