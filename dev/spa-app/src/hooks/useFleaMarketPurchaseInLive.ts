import { useSession } from '#/hooks/useSession';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import { PURCHASE_FLEA_MARKET_ITEM } from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import type { FleaMarketItemCamel } from '@/services/fleamarket/type';
import { usePointStore } from '@/stores/pointStore';
import type { MessageWithType } from '@/types/MessageWithType';
import { trackEvent } from '@/utils/eventTracker';
import { postToNext } from '@/utils/next';

type PurchaseResponse = {
  code: number;
  message: string;
  data?: {
    newPointBalance: number;
    transactionId: string;
    purchasedItem: unknown;
  };
  pointLessMessage?: string;
};

type LiveChatMessage = {
  text: string;
  sender_name: string;
  sender_id: string;
  message_type: string;
  receiver_id: string;
  fleaMarketItemPurchased?: {
    messageType: string;
    itemId: string;
    amount: number;
  };
};

type UseFleaMarketPurchaseInLiveParams = {
  receiverId: string;
  onSendMessageToChannel:
    | ((message: LiveChatMessage) => Promise<void>)
    | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  onClose: () => void;
  onPurchaseSuccess:
    | ((itemTitle: string, newPoint: number) => void)
    | undefined;
};

type UseFleaMarketPurchaseInLiveReturn = {
  purchaseItem: (
    item: FleaMarketItemCamel,
    totalPrice: number,
  ) => Promise<boolean>;
  isPurchasing: boolean;
  error: string | null;
  clearError: () => void;
};

export function useFleaMarketPurchaseInLive({
  receiverId,
  onSendMessageToChannel,
  setLiveMessages,
  onClose,
  onPurchaseSuccess,
}: UseFleaMarketPurchaseInLiveParams): UseFleaMarketPurchaseInLiveReturn {
  const { data: session } = useSession();
  const myPoint = usePointStore((s) => s.currentPoint);
  const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const purchaseItem = useCallback(
    async (item: FleaMarketItemCamel, totalPrice: number): Promise<boolean> => {
      if (isPurchasing) return false;
      if (!session?.user?.id || !session?.user?.name) {
        setError('ログインが必要です');
        return false;
      }

      // ポイント残高チェック
      if (myPoint < totalPrice) {
        setError(
          `ポイントが不足しています（必要: ${totalPrice}pt / 残高: ${myPoint}pt）`,
        );
        return false;
      }

      setIsPurchasing(true);
      setError(null);

      try {
        // GA4: 購入ボタンタップイベント
        trackEvent(event.TAP_PURCHASE_FLEA_MARKET_ITEM, {
          item_id: item.itemId,
          seller_id: item.sellerId,
          price: item.price,
          user_id: session.user.id,
        });

        const response = await postToNext<PurchaseResponse>(
          PURCHASE_FLEA_MARKET_ITEM,
          {
            itemId: item.itemId,
            price: totalPrice,
            token: session.user.token,
          },
        );

        if (response.type === 'error') {
          setError(response.message || '購入処理に失敗しました');
          return false;
        }

        if (response.code !== 0) {
          // ポイント不足
          if (response.code === 70) {
            setError(response.pointLessMessage || 'ポイントが不足しています');
          } else {
            setError(response.message || '購入処理に失敗しました');
          }
          return false;
        }

        // 成功時の処理
        const newPointBalance =
          response.data?.newPointBalance ?? myPoint - totalPrice;
        const transactionId = response.data?.transactionId ?? '';

        // ポイント更新
        setCurrentPoint(newPointBalance);

        // GA4: 購入完了イベント（ライブ配信中の購入時は source と broadcaster_id を追加）
        trackEvent(event.COMPLETE_PURCHASE_FLEA_MARKET_ITEM, {
          item_id: item.itemId,
          seller_id: item.sellerId,
          price: item.price,
          user_id: session.user.id,
          transaction_id: transactionId,
          source: 'live_stream',
          broadcaster_id: receiverId,
        });

        // 購入コメントを送信
        const purchaseMessage = `「${item.title}」を購入しました`;

        if (onSendMessageToChannel) {
          await onSendMessageToChannel({
            text: purchaseMessage,
            sender_name: session.user.name,
            sender_id: session.user.id,
            message_type: 'chat',
            receiver_id: receiverId,
            fleaMarketItemPurchased: {
              messageType: 'fleaMarketItemPurchased',
              itemId: item.itemId,
              amount: totalPrice,
            },
          });
        }

        // 自分の画面にメッセージを追加
        setLiveMessages((prev) => [
          ...prev,
          {
            text: `${session.user.name}: ${purchaseMessage}`,
            type: 'normal',
            sender_id: session.user.id,
          },
        ]);

        // コールバック実行
        onPurchaseSuccess?.(item.title, newPointBalance);

        // モーダルを閉じる
        onClose();

        return true;
      } catch (err) {
        console.error('Purchase error:', err);
        setError('購入処理中にエラーが発生しました');
        return false;
      } finally {
        setIsPurchasing(false);
      }
    },
    [
      isPurchasing,
      session,
      myPoint,
      setCurrentPoint,
      receiverId,
      onSendMessageToChannel,
      setLiveMessages,
      onClose,
      onPurchaseSuccess,
    ],
  );

  return {
    purchaseItem,
    isPurchasing,
    error,
    clearError,
  };
}
