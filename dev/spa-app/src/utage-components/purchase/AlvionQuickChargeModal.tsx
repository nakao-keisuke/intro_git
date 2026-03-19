// Image component removed (use <img> directly);
import type React from 'react';
import { useRef, useState } from 'react';

import { SPECIAL_PURCHASE_CONFIG } from '@/app/[locale]/(tab-layout)/purchase/components/BonusCourseItem';
import { APPLICATION_ID, getApplicationId } from '@/constants/applicationId';
import {
  type BonusPointPackage,
  getBonusCourseTypeByMoney,
  getBonusPointPackages,
  getFilteredPointPackages,
  type PointPackage,
  QUICK_CHARGE_BONUS_IMAGES,
  resolvePackageId,
} from '@/constants/pointPackages';
import { useQuickCharge } from '@/hooks/requests/useQuickCharge';
import {
  clearCreditPurchaseCourseCache,
  useGetCreditPurchaseCourseInfo,
} from '@/hooks/useGetCreditPurchaseCourseInfo.hook';
import { native } from '@/libs/nativeBridge';
import { usePointStore } from '@/stores/pointStore';
import { useUIStore } from '@/stores/uiStore';
import { PaymentMethod } from '@/types/payment';
import { getTopColorClass } from '@/utils/colorUtils';
import { PurchaseType, sendPurchaseEvent } from '@/utils/purchaseUtils';
import { separateApp } from '@/utils/SeparateApp';

type Props = {
  token: string;
  onClose: () => void;
  onSuccess: (updatedPoint: number) => void;
  onOpenPaymentModal?: () => void;
  title?: string;
  hideLowestPackage?: boolean;
  source?: string;
};

const AlvionQuickChargeModal = ({
  token,
  onClose,
  onSuccess,
  onOpenPaymentModal,
  title,
  hideLowestPackage = false,
  source,
}: Props) => {
  // 定数
  const PURCHASE_FAILURE_MESSAGE =
    'ポイント購入に失敗しました。再度購入して下さい。';

  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<
    PointPackage | BonusPointPackage | null
  >(null);
  const userCurrentPoint = usePointStore((s) => s.currentPoint);
  const { creditPurchaseCourseInfo } = useGetCreditPurchaseCourseInfo();
  const isPC = useUIStore((s) => s.isPC);

  const basePointPackages = getFilteredPointPackages(hideLowestPackage);
  const bonusPointPackages = getBonusPointPackages(creditPurchaseCourseInfo);
  const availableBonusPackages = bonusPointPackages
    .filter((pkg) => pkg.isBonusExist)
    .filter((pkg) => getBonusCourseTypeByMoney(pkg.money) !== null);

  // ボーナスが利用可能な金額のポイント数マップを作成
  const bonusPointMap = new Map(
    availableBonusPackages.map((pkg) => [
      pkg.money,
      { point: pkg.point, beforePoint: pkg.beforePoint },
    ]),
  );

  // ボーナスが利用可能な場合、通常パッケージのポイント数をボーナスのポイント数に置き換え
  const pointPackages = basePointPackages.map((pkg) => {
    const bonusInfo = bonusPointMap.get(pkg.money);
    if (bonusInfo) {
      return {
        ...pkg,
        point: bonusInfo.point,
        beforePoint: bonusInfo.beforePoint,
      };
    }
    return pkg;
  });

  const handlePackageClick = (pkg: PointPackage | BonusPointPackage) => {
    const isUtageApplication = separateApp();
    if (isUtageApplication) {
      // Utageユーザー: 既存のクイックチャージフロー
      setSelectedPackage(pkg);
      setShowConfirm(true);
    } else if (getApplicationId() === APPLICATION_ID.NATIVE_ANDROID) {
      // Renka Android: postMessageで課金リクエスト（ページ遷移による通話切断を防止）
      native
        .startPurchase(resolvePackageId(pkg.packageId))
        .catch(() => undefined);
      onClose();
    } else {
      // Native iOS: URL遷移でネイティブ側がインターセプト（アプリごとにプレフィックスを変換）
      window.location.href = `/${resolvePackageId(pkg.packageId)}`;
    }
  };

  // 送信済みフラグ（useRefで重複送信を防ぐ）
  const hasSentEventRef = useRef(false);

  // useQuickChargeフックを使用
  const { startPurchase } = useQuickCharge();

  const handleQuickChargeConfirm = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    try {
      const result = await startPurchase(
        selectedPackage.point,
        selectedPackage.money,
      );

      if (result.success && result.response) {
        // 重複チェック: 既に送信済みの場合はスキップ
        if (!hasSentEventRef.current) {
          // GA4 purchaseイベント送信処理（クイックチャージは常にクレジットカード）
          sendPurchaseEvent(
            selectedPackage.money,
            selectedPackage.point,
            PurchaseType.QUICK_CHARGE,
            PaymentMethod.CREDIT,
            result.response.paymentIntentId,
            undefined,
            source,
          );

          // 送信済みフラグを立てる
          hasSentEventRef.current = true;
        }

        // ボーナスコース購入可否情報のキャッシュをクリア
        // これにより次回モーダルを開いたときに最新の購入可否情報が取得される
        clearCreditPurchaseCourseCache(token);

        // ポイント更新はonSuccess(handlePurchaseSuccess)で実行
        onSuccess(selectedPackage.point);
        onClose();
      } else {
        console.error('Quick charge failed');
        alert(PURCHASE_FAILURE_MESSAGE);
        // エラーの場合はAlvionPaymentModalを開く
        onClose();
        onOpenPaymentModal?.();
      }
    } catch (error) {
      console.error('Quick charge error:', error);
      alert(PURCHASE_FAILURE_MESSAGE);
      // エラーの場合はAlvionPaymentModalを開く
      onClose();
      onOpenPaymentModal?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickChargeCancel = () => {
    setShowConfirm(false);
    setSelectedPackage(null);
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
        className={`fixed ${isPC ? 'top-1/2 -translate-y-1/2' : 'bottom-3'} right-3 left-3 mx-auto h-auto max-h-[80vh] max-w-[600px] animate-popup select-none overflow-y-auto rounded-xl bg-white`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between rounded-t-xl bg-white px-4 py-2">
          <button
            className="flex h-8 min-w-[64px] cursor-pointer items-center justify-center rounded-md border-none bg-none px-2 font-bold text-base text-blue-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
            disabled={isProcessing}
          >
            閉じる
          </button>
          <div className="font-bold text-base text-gray-800">ポイント購入</div>
          <div className="flex h-8 min-w-[64px] items-center gap-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 font-extrabold text-base text-white">
              Ｐ
            </span>
            <span className="font-extrabold text-gray-900 text-lg tabular-nums tracking-tight">
              {userCurrentPoint.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="px-4 pt-1 pb-3">
          {title && (
            <div className="mt-1 text-center font-bold text-lg text-red-500">
              {title}
            </div>
          )}
          {showConfirm && selectedPackage ? (
            // 確認モーダル
            <div className="flex flex-col items-center justify-center">
              <div className="flex w-3/5 flex-col items-center justify-between gap-1">
                <div className="flex w-full items-center justify-between">
                  <span className="text-base text-gray-800">金額</span>
                  <span className="font-bold text-gray-800 text-lg">
                    {selectedPackage.money.toLocaleString()}円
                  </span>
                </div>
                <div className="flex w-full items-center justify-between">
                  <span className="text-base text-gray-800">ポイント</span>
                  <span className="font-bold text-gray-800 text-lg">
                    {selectedPackage.point.toLocaleString()}pt
                    {'beforePoint' in selectedPackage &&
                      selectedPackage.beforePoint && (
                        <span className="ml-2 text-gray-400 text-sm line-through">
                          ({selectedPackage.beforePoint.toLocaleString()}pt)
                        </span>
                      )}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex w-full justify-center gap-2">
                <button
                  className="w-1/2 cursor-pointer rounded-lg border-none bg-gray-500 px-8 py-3 text-base text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-gray-300"
                  onClick={handleQuickChargeCancel}
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
          ) : (
            <>
              {/* ボーナスコース表示エリア */}
              {availableBonusPackages.length > 0 && (
                <div className="mb-5 space-y-2">
                  {availableBonusPackages.map((pkg, index) => {
                    const bonusType = getBonusCourseTypeByMoney(pkg.money);
                    if (!bonusType) return null;
                    const { src, alt } = SPECIAL_PURCHASE_CONFIG[bonusType];

                    return (
                      <div
                        key={`bonus-${index}`}
                        className="relative cursor-pointer transition-transform duration-200 hover:scale-[0.98] hover:opacity-90"
                        onClick={() => handlePackageClick(pkg)}
                      >
                        {/* SP用画像 */}
                        <div className="w-full md:hidden">
                          <Image
                            src={src}
                            alt={alt}
                            width={400}
                            height={200}
                            className="h-auto w-full rounded-lg"
                          />
                        </div>

                        {/* PC用画像 */}
                        <div className="hidden w-full md:block">
                          <Image
                            src={src}
                            alt={alt}
                            width={1200}
                            height={400}
                            className="h-auto w-full rounded-lg"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 通常ポイントパッケージ一覧 */}
              <div className="mx-auto grid max-w-none grid-cols-2 gap-2">
                {pointPackages.map((pkg) => {
                  const hasBonusImage =
                    bonusPointMap.has(pkg.money) &&
                    QUICK_CHARGE_BONUS_IMAGES[pkg.money];
                  const bonusImageSrc = QUICK_CHARGE_BONUS_IMAGES[pkg.money];

                  return (
                    <div
                      key={pkg.packageId}
                      className="m-0 w-full hover:-translate-y-0.5 hover:opacity-80"
                    >
                      <div
                        className="relative z-[1] flex h-auto w-full cursor-pointer flex-col justify-between rounded-md border border-gray-300 bg-slate-50 pb-0 shadow-lg"
                        onClick={() => handlePackageClick(pkg)}
                      >
                        {pkg.text && (
                          <div className="absolute -top-2 -right-1 z-10 animate-glitter rounded-full bg-orange-400 px-3 py-0.5 font-bold text-white text-xs shadow-sm">
                            {pkg.text}
                          </div>
                        )}
                        <div
                          className={`relative mb-0 h-20 overflow-hidden rounded-t-md ${!hasBonusImage ? getTopColorClass(pkg.color) : ''}`}
                        >
                          {hasBonusImage && bonusImageSrc && (
                            <Image
                              src={bonusImageSrc}
                              alt="ボーナスコース背景画像"
                              fill
                              className="object-cover"
                            />
                          )}
                          <div className="relative z-10 mt-3 text-center font-bold text-3xl text-white">
                            {pkg.point.toLocaleString()}
                            <span className="text-xl">pt</span>
                          </div>
                          {pkg.plus && (
                            <div className="relative z-10 mx-auto mt-0.5 w-4/5 rounded-full bg-white text-center font-bold text-base text-red-500">
                              {pkg.plus.toLocaleString()}円お得！
                            </div>
                          )}
                        </div>
                        <div className="mb-0 flex h-8 items-center justify-center rounded-b-md bg-white p-0">
                          <div className="text-center font-bold text-gray-600 text-xl">
                            {pkg.money.toLocaleString()}
                            <span className="text-sm">円</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
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

export default AlvionQuickChargeModal;
