import { useLocation } from '@tanstack/react-router';
import type React from 'react';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { quickChargeRequest } from '@/apis/quick-charge';
import { event as ga4Event } from '@/constants/ga4Event';
import type { BonusPointPackage } from '@/constants/pointPackages';
import { useQuickCharge } from '@/hooks/requests/useQuickCharge';
import { clearCreditPurchaseCourseCache } from '@/hooks/useGetCreditPurchaseCourseInfo.hook';
import { usePointStore } from '@/stores/pointStore';
import { PaymentMethod } from '@/types/payment';
import { trackEvent } from '@/utils/eventTracker';
import { PurchaseType, sendPurchaseEvent } from '@/utils/purchaseUtils';

type Props = {
  token: string;
  packageInfo: BonusPointPackage;
  onClose: () => void;
  onSuccess: (updatedPoint: number) => void;
  onOpenPaymentModal?: () => void;
  source?: string;
};

/**
 * ボーナスコース用のクイックチャージ確認モーダル
 * パッケージ選択をスキップして直接確認画面を表示する
 */
const BonusQuickChargeConfirmModal: React.FC<Props> = ({
  token,
  packageInfo,
  onClose,
  onSuccess,
  onOpenPaymentModal,
  source,
}) => {
  const PURCHASE_FAILURE_MESSAGE =
    'ポイント購入に失敗しました。再度購入して下さい。';

  const [isProcessing, setIsProcessing] = useState(false);
  const userCurrentPoint = usePointStore((s) => s.currentPoint);
  const hasSentEventRef = useRef(false);
  const pathname = usePathname();

  const handlePurchaseError = (error: unknown) => {
    console.error('Quick charge error:', error);
    toast.error(PURCHASE_FAILURE_MESSAGE);
    onClose();
    onOpenPaymentModal?.();
  };

  // useQuickChargeフックを使用
  const { startPurchase } = useQuickCharge();

  const handleQuickChargeConfirm = async () => {
    setIsProcessing(true);
    try {
      const result = await startPurchase(packageInfo.point, packageInfo.money);

      if (result.success && result.response) {
        if (!hasSentEventRef.current) {
          sendPurchaseEvent(
            packageInfo.money,
            packageInfo.point,
            PurchaseType.QUICK_CHARGE,
            PaymentMethod.CREDIT,
            result.response.paymentIntentId,
            undefined,
            source,
          );
          trackEvent(ga4Event.PURCHASE_SAME_CARD, {
            amount: packageInfo.money,
            point: packageInfo.point,
            from: pathname,
          });
          hasSentEventRef.current = true;
        }

        clearCreditPurchaseCourseCache(token);
        onSuccess(packageInfo.point);
        onClose();
      } else {
        handlePurchaseError('決済に失敗しました');
      }
    } catch (error) {
      handlePurchaseError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const onClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100000] bg-transparent"
      onClick={onClickOutside}
    >
      <div
        className="fixed right-3 bottom-3 left-3 mx-auto h-auto max-w-[600px] animate-popup select-none rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-xl bg-white px-4 py-2">
          <div className="font-bold text-base text-gray-800">
            ポイントチャージ
          </div>
          <button
            className="flex h-7 w-7 cursor-pointer items-center justify-center border-none bg-none text-2xl text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        <div className="px-4 pt-2 pb-4">
          <p className="mb-4 flex items-center justify-end gap-2 px-4">
            <span className="sr-only">残りポイント</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 font-extrabold text-base text-white">
              Ｐ
            </span>
            <span className="font-extrabold text-2xl text-gray-900 tabular-nums tracking-tight">
              {userCurrentPoint.toLocaleString()}
            </span>
          </p>

          <div className="flex flex-col items-center justify-center">
            <div className="flex w-full flex-col items-center justify-between gap-1">
              <div className="flex w-full items-center justify-between">
                <span className="text-base text-gray-800">金額</span>
                <span className="font-bold text-gray-800 text-lg">
                  {packageInfo.money.toLocaleString()}円
                </span>
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="text-base text-gray-800">ポイント</span>
                <span className="font-bold text-gray-800 text-lg">
                  {packageInfo.beforePoint && (
                    <span className="ml-2 text-gray-400 text-sm line-through">
                      ({packageInfo.beforePoint.toLocaleString()}pt)
                    </span>
                  )}
                  {packageInfo.point.toLocaleString()}pt
                </span>
              </div>
            </div>
            <div className="mt-4 flex w-full justify-center gap-2">
              <button
                className="w-1/2 cursor-pointer rounded-lg border-none bg-gray-500 px-8 py-3 text-base text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-300"
                onClick={onClose}
                disabled={isProcessing}
              >
                キャンセル
              </button>
              <button
                className="w-1/2 cursor-pointer rounded-lg border-none bg-red-500 px-8 py-3 text-base text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-300"
                onClick={handleQuickChargeConfirm}
                disabled={isProcessing}
              >
                購入する
              </button>
            </div>
            <p className="mt-2 text-gray-500 text-xs">
              ※「購入する」ボタンクリックで即座に決済されます
            </p>
          </div>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-white/90">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-transparent border-t-red-500" />
            <span>決済中...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BonusQuickChargeConfirmModal;
