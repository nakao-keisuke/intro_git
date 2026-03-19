// Image component removed (use <img> directly);
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { APPLICATION_ID, getApplicationId } from '@/constants/applicationId';
import { getPcBonusImageSrc } from '@/constants/bonusImages';
import {
  type BonusPointPackage,
  getBonusPointPackages,
  getFilteredPointPackages,
  type PointPackage,
  resolvePackageId,
} from '@/constants/pointPackages';
import { useGetCreditPurchaseCourseInfo } from '@/hooks/useGetCreditPurchaseCourseInfo.hook';
import { native } from '@/libs/nativeBridge';
import { usePointStore } from '@/stores/pointStore';
import { PaymentMethod } from '@/types/payment';
import { getTopColorClass } from '@/utils/colorUtils';
import { PurchaseType, sendPurchaseEvent } from '@/utils/purchaseUtils';
import { separateApp } from '@/utils/SeparateApp';

type Props = {
  token: string;
  onClose: () => void;
  onSuccess: (updatedPoint: number) => void;
  title?: string;
  isPC?: boolean;
  hideLowestPackage?: boolean;
  from?: string;
  source?: string;
};

const AlvionPaymentModal = ({
  token,
  onClose,
  onSuccess,
  title,
  isPC,
  hideLowestPackage = false,
  from,
  source,
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const updatePointOptimistic = usePointStore((s) => s.updatePointOptimistic);
  const { creditPurchaseCourseInfo, loading: bonusInfoLoading } =
    useGetCreditPurchaseCourseInfo();

  const bonusPointPackages = getBonusPointPackages(creditPurchaseCourseInfo);

  const pointPackages = getFilteredPointPackages(hideLowestPackage);

  // 表示可能なボーナスコースを取得
  const availableBonusPackages = bonusPointPackages.filter(
    (pkg) => pkg.isBonusExist,
  );

  const defaultPackage = pointPackages[0] ?? null;
  const [selectedPackage, setSelectedPackage] = useState<PointPackage | null>(
    defaultPackage,
  );

  // 送信済みフラグ（useRefで重複送信を防ぐ）
  const hasSentEventRef = useRef(false);

  const onClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePackageClick = (pkg: PointPackage | BonusPointPackage) => {
    const isUtageApplication = separateApp();
    if (isUtageApplication) {
      setSelectedPackage(pkg);
      setShowPayment(true);
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

  const alvionUrl = selectedPackage
    ? `${
        import.meta.env.VITE_ALVION_URL || 'https://localhost:3001'
      }/purchase/stripe-payment?sid=${encodeURIComponent(token)}&amount=${
        selectedPackage.money
      }&point=${selectedPackage.point}&embedded=true${
        from ? `&from=${encodeURIComponent(from)}` : ''
      }`
    : '';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        import.meta.env.VITE_ALVION_URL,
        'http://localhost:3001',
        'https://localhost:3001',
      ];

      if (!allowedOrigins.includes(event.origin)) return;

      if (
        (event.data.type === 'payment_success' ||
          event.data.type === 'payment_intent_confirmed') &&
        selectedPackage &&
        !hasSentEventRef.current
      ) {
        setIsProcessing(true);

        // 送信済みフラグを立てる（同一useEffect内での重複を防ぐ）
        hasSentEventRef.current = true;

        const paymentMethod =
          (event.data.paymentMethod as PaymentMethod) || PaymentMethod.CREDIT;
        const transactionId = event.data.paymentIntentId;

        // GA4 purchaseイベント送信処理
        sendPurchaseEvent(
          selectedPackage.money,
          selectedPackage.point,
          PurchaseType.NORMAL,
          paymentMethod,
          transactionId,
          undefined,
          source,
        );

        setTimeout(() => {
          updatePointOptimistic(selectedPackage.point);
          onSuccess(selectedPackage.point);
        }, 500);
      } else if (event.data.type === 'return_to_selection') {
        setIsProcessing(false);
        setShowPayment(false);
      } else if (event.data.type === 'payment_cancelled') {
        setIsProcessing(false);
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedPackage, onSuccess, updatePointOptimistic, onClose, source]);

  const backdropClass = isPC
    ? 'fixed left-0 right-0 bottom-0 top-[100px] bg-black/50 flex items-center justify-center z-[100000]'
    : 'fixed inset-0 bg-black/50 flex justify-center items-end md:items-center z-[100000]';

  const modalContentClass =
    'relative bg-white w-full md:w-[80%] md:max-w-[600px] rounded-t-[20px] md:rounded-[10px] pb-0 md:pb-[10px] select-none animate-[popup_0.3s_cubic-bezier(0.22,1,0.36,1)_forwards] max-h-[80vh] overflow-y-auto md:max-h-none md:overflow-visible';

  return (
    <div className={backdropClass} onClick={onClickOutside}>
      <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
        {/* 通話１分前の場合に表示 */}
        {title && (
          <div className="z-30 w-full rounded-t-[20px] bg-[#ff4530] p-[5px] text-center font-bold text-base text-white md:rounded-t-[10px]">
            {title}
          </div>
        )}
        <div className="relative h-full w-full rounded-t-[20px] bg-slate-50 md:rounded-[10px]">
          <button
            type="button"
            className="absolute top-2.5 right-2.5 z-10 cursor-pointer border-0 bg-transparent p-0 text-2xl text-[#666]"
            onClick={onClose}
          >
            ×
          </button>
          <div className="px-[5%] pt-[5%] pb-[10px] font-bold text-[#1c1c1c]">
            ポイント追加
          </div>

          {!showPayment ? (
            <>
              {/* ボーナスコース表示エリア */}
              {availableBonusPackages.length > 0 && (
                <div className="px-5">
                  {availableBonusPackages.map((pkg, index) => {
                    const imageSrc = getPcBonusImageSrc(index);

                    return (
                      <div
                        key={`bonus-${index}`}
                        className="mb-2.5 cursor-pointer rounded-lg bg-[linear-gradient(to_right,#5a76e8,#c13fd5,#fed06e)] text-[15px] text-white shadow-[0_3px_5px_0_rgba(0,0,0,0.241)] transition duration-200 hover:-translate-y-0.5 hover:opacity-80"
                        onClick={() => handlePackageClick(pkg)}
                      >
                        <Image
                          src={imageSrc}
                          alt={pkg.text ?? 'ボーナスコース'}
                          width={800}
                          height={200}
                          className="h-auto w-full rounded-lg"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 通常コース表示エリア */}
              <div className="mx-auto grid max-w-none grid-cols-3 gap-2 px-4 pb-2">
                {pointPackages.map((pkg) => (
                  <div
                    key={pkg.point}
                    className="m-0 w-full hover:-translate-y-0.5 hover:opacity-80"
                    onClick={() => handlePackageClick(pkg)}
                  >
                    <div className="relative z-[1] flex h-auto w-full cursor-pointer flex-col justify-between rounded-md border border-gray-300 bg-slate-50 pb-0 shadow-lg">
                      <div
                        className={`mb-0 h-20 rounded-t-md ${getTopColorClass(pkg.color)}`}
                      >
                        {!pkg.isBonusExist && pkg.text && (
                          <div className="absolute -top-2 -right-1 animate-glitter rounded-full bg-orange-400 px-3 py-0.5 font-bold text-white text-xs shadow-sm">
                            {pkg.text}
                          </div>
                        )}
                        <div className="z-10 mt-5 text-center font-bold text-2xl text-white">
                          {pkg.point.toLocaleString()}
                          <span className="text-xl">pt</span>
                        </div>
                        {pkg.plus && pkg.plus > 0 && (
                          <div className="mx-auto w-4/5 rounded-full bg-white text-center font-bold text-red-500 text-xs">
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
                ))}
              </div>
            </>
          ) : (
            <div style={{ zIndex: '1000000000000' }}>
              {isLoading && (
                <div className="flex h-[200px] items-center justify-center text-[#666] text-lg">
                  読み込み中...
                </div>
              )}
              {isProcessing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-[rgba(0,0,0,0.1)] border-l-[#ff4530]"></div>
                  <div className="mt-2.5 text-center text-[#333] text-base">
                    決済処理中...
                  </div>
                </div>
              )}
              <iframe
                src={alvionUrl}
                className="z-[5] mt-2.5 h-[600px] w-full border-0"
                onLoad={() => setIsLoading(false)}
                allow="payment"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                referrerPolicy="origin"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlvionPaymentModal;
