// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type {
  BonusPointPackage,
  SpecialPurchaseType,
} from '@/constants/pointPackages';
import { useNavigateWithOrigin } from '@/hooks/useNavigateWithOrigin';
import { usePaymentCustomerData } from '@/hooks/usePaymentCustomerData.hook';
import { useRefreshMyPoint } from '@/hooks/useRefreshMyPoint.hook';
import { usePointStore } from '@/stores/pointStore';
import { trackEvent } from '@/utils/eventTracker';
import { separateApp } from '@/utils/SeparateApp';

type BonusPurchaseConfig = {
  /** トラッキングイベント名 (例: 'OPEN_1ST_PURCHASE_MESSAGE') */
  trackingEventName: string;
  /** ボーナスコースタイプ (例: 'first', 'second', etc.) */
  purchaseType: SpecialPurchaseType;
};

/** purchaseTypeとpackage番号のマッピング */
const PURCHASE_TYPE_INDEX: Record<SpecialPurchaseType, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
};

/** purchaseTypeとボーナスパッケージ情報のマッピング */
const PURCHASE_TYPE_TO_PACKAGE: Record<SpecialPurchaseType, BonusPointPackage> =
  {
    first: {
      point: 1000,
      money: 800,
      text: '初回限定！',
      beforePoint: 550,
      packageId: 'renka_point_package_1',
    },
    second: {
      point: 2500,
      money: 2900,
      text: '2回目限定！',
      beforePoint: 2000,
      packageId: 'renka_point_package_2',
    },
    third: {
      point: 4400,
      money: 4900,
      text: '3回目限定！',
      beforePoint: 3600,
      packageId: 'renka_point_package_3',
    },
    fourth: {
      point: 9000,
      money: 10000,
      text: '4回目限定！',
      beforePoint: 8000,
      packageId: 'renka_point_package_4',
    },
    fifth: {
      point: 14000,
      money: 14900,
      text: '5回目限定！',
      beforePoint: 12000,
      packageId: 'renka_point_package_5',
    },
  };

/**
 * ボーナスコースページで共通のロジックを提供するカスタムフック
 */
export const useBonusPurchase = (config: BonusPurchaseConfig) => {
  const router = useRouter();
  const nav = useNavigateWithOrigin();
  const { data: session } = useSession();
  const { canQuickCharge } = usePaymentCustomerData();
  const updatePointOptimistic = usePointStore((s) => s.updatePointOptimistic);
  const refreshMyPoint = useRefreshMyPoint();
  const [showQuickChargeModal, setShowQuickChargeModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // 現在のpurchaseTypeに対応するパッケージ情報
  const packageInfo = PURCHASE_TYPE_TO_PACKAGE[config.purchaseType];

  // 初期化処理：トラッキングとポイント取得
  useEffect(() => {
    trackEvent(config.trackingEventName);
    refreshMyPoint();
  }, [config.trackingEventName, refreshMyPoint]);

  // 戻るボタンハンドラー
  const handleBack = () => {
    router.back();
  };

  // クイックチャージ成功ハンドラー
  const handleQuickChargeSuccess = (addedPoints: number) => {
    updatePointOptimistic(addedPoints);
    toast(
      <div className="inline-flex items-center">
        <Image
          src="/images/purchase_check_icon.webp"
          alt="購入完了"
          width={32}
          height={32}
          className="mr-2"
        />
        <span className="leading-8">{addedPoints}ポイントを獲得しました。</span>
      </div>,
      {
        theme: 'light',
        className: 'bg-white',
        hideProgressBar: false,
        autoClose: 3000,
      },
    );
    setShowQuickChargeModal(false);
    nav.push('/girls/all', nav.originFromPage());
  };

  // 購入ボタンハンドラー
  const handlePurchaseClick = () => {
    const isUtageApplication = separateApp();

    if (!isUtageApplication) {
      // Renkaユーザー: ネイティブ課金ページにリダイレクト
      const packageNumber = PURCHASE_TYPE_INDEX[config.purchaseType];
      const packageId = `renka_point_package_${packageNumber}`;
      window.location.href = packageId;
      return;
    }

    // Utageユーザー: クイックチャージ可能な場合は確認モーダルを直接表示
    if (canQuickCharge) {
      setShowConfirmModal(true);
      return;
    }
    nav.push('/purchase?source=bonus', nav.originFromModal('bonus-purchase'));
  };

  // モーダルを閉じるハンドラー
  const handleCloseModal = () => {
    setShowQuickChargeModal(false);
  };

  // 確認モーダルを閉じるハンドラー
  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  // 通常購入ページへ遷移するハンドラー
  const handleOpenPaymentModal = () => {
    nav.push('/purchase?source=bonus', nav.originFromModal('bonus-purchase'));
  };

  return {
    session,
    showQuickChargeModal,
    showConfirmModal,
    packageInfo,
    handleBack,
    handleQuickChargeSuccess,
    handlePurchaseClick,
    handleCloseModal,
    handleCloseConfirmModal,
    handleOpenPaymentModal,
  };
};
