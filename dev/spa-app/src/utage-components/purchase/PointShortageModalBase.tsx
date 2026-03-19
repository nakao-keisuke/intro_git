import { IconPhone } from '@tabler/icons-react';
import { useSession } from '#/hooks/useSession';
// TODO: i18n - import { useTranslations } from '#/i18n';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { isNativeApplication } from '@/constants/applicationId';
import { HTTP_CHECK_MISSION_COMPLETED } from '@/constants/endpoints';
import {
  BONUS_POINT_PACKAGES,
  type BonusPointPackage,
  POINT_PACKAGES,
  type PointPackage,
} from '@/constants/pointPackages';
import { useGetCreditPurchaseCourseInfo } from '@/hooks/useGetCreditPurchaseCourseInfo.hook';
import { usePurchaseAttribution } from '@/hooks/usePurchaseAttribution';
import { usePaymentStore } from '@/stores/paymentStore';
import { usePointStore } from '@/stores/pointStore';
import type { ResponseData } from '@/types/NextApi';
import { PURCHASE_FLOW } from '@/types/purchaseAttribution';
import { postToNext } from '@/utils/next';
import { showPurchaseSuccessToast } from '@/utils/purchaseToast';
import { separateApp } from '@/utils/SeparateApp';
import BonusQuickChargeConfirmModal from './BonusQuickChargeConfirmModal';
import PriceSelector from './PriceSelector';

type Package = PointPackage | BonusPointPackage;

/** 通話発信時のポイント不足モーダル専用価格帯（2,000pt, 3,600pt, 12,000pt） */
export const CALL_POINT_PACKAGES = POINT_PACKAGES.filter((pkg) =>
  [2900, 4900, 14900].includes(pkg.money),
);

/** 利用可能なボーナスコースを取得（1回目から順にチェック） */
const getAvailableBonusPackage = (
  creditPurchaseCourseInfo:
    | {
        canBuyFirstBonusCourse?: boolean;
        canBuySecondBonusCourse?: boolean;
        canBuyThirdBonusCourse?: boolean;
        canBuyFourthBonusCourse?: boolean;
        canBuyFifthBonusCourse?: boolean;
      }
    | undefined,
): BonusPointPackage | null => {
  if (!creditPurchaseCourseInfo) return null;

  const bonusFlags = [
    { flag: creditPurchaseCourseInfo.canBuyFirstBonusCourse, money: 800 },
    { flag: creditPurchaseCourseInfo.canBuySecondBonusCourse, money: 2900 },
    { flag: creditPurchaseCourseInfo.canBuyThirdBonusCourse, money: 4900 },
    { flag: creditPurchaseCourseInfo.canBuyFourthBonusCourse, money: 10000 },
    { flag: creditPurchaseCourseInfo.canBuyFifthBonusCourse, money: 14900 },
  ];

  for (const { flag, money } of bonusFlags) {
    if (flag) {
      const bonusPkg = BONUS_POINT_PACKAGES.find((pkg) => pkg.money === money);
      if (bonusPkg) return bonusPkg;
    }
  }

  return null;
};

type PaymentStep = 'selection' | 'confirm';

type Props = {
  /** モーダルを閉じる */
  onClose: () => void;
  /** 購入成功時のコールバック */
  onPurchaseSuccess: (addedPoints: number) => void;
  /** サブタイトル（消費ポイントの説明） */
  subtitle: ReactNode;
  /** 購入ボタンの文言 */
  buttonText: string;
  /** ヘッダー部分のカスタムコンテンツ（オプション） */
  headerContent?: ReactNode;
  /** 使用する価格パッケージ（デフォルト: CALL_POINT_PACKAGES） */
  packages?: Package[];
  /** 人気ラベルを表示するパッケージの金額 */
  popularMoney?: number;
  /** お得ラベルを表示するパッケージのポイント数 */
  dealPoint?: number;
  /** イベント送信用のsource */
  source?: string;
  /** Purchase Attribution用のsource_ui識別子（例: "modal.call_point_shortage"） */
  sourceUiBase?: string;
  /** タイトル横のアイコン（デフォルト: IconPhone） */
  icon?: typeof IconPhone;
  /** アイコンの色クラス（デフォルト: text-green-600） */
  iconClassName?: string;
  /** タイトル「ポイントが不足しています」を非表示にする */
  hideTitle?: boolean;
};

/**
 * ポイント不足モーダルのベースコンポーネント
 * 共通のレイアウト・課金処理を提供
 */
const PointShortageModalBase = ({
  onClose,
  onPurchaseSuccess,
  subtitle,
  buttonText,
  headerContent,
  packages = CALL_POINT_PACKAGES,
  popularMoney = 4900,
  dealPoint = 12000,
  source,
  sourceUiBase,
  icon: Icon = IconPhone,
  iconClassName = 'text-green-600',
  hideTitle = false,
}: Props) => {
  const t = useTranslations('pointShortage');
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );
  const { data: session } = useSession();
  const canQuickCharge = usePaymentStore((s) => s.canQuickCharge);
  const updatePointOptimistic = usePointStore((s) => s.updatePointOptimistic);
  const { creditPurchaseCourseInfo, loading: bonusInfoLoading } =
    useGetCreditPurchaseCourseInfo();
  const isNativeApp = isNativeApplication();
  const { trackPurchaseIntent } = usePurchaseAttribution();
  const [isOnboardingMissionCompleted, setIsOnboardingMissionCompleted] =
    useState<boolean | null>(isNativeApp ? null : false);

  useEffect(() => {
    if (!isNativeApp) return;
    let isMounted = true;

    const fetchMissionCompleted = async () => {
      const response = await postToNext<
        ResponseData<{ isAllMissionCompleted: boolean }>
      >(HTTP_CHECK_MISSION_COMPLETED);
      if (!isMounted) return;
      if (response.type === 'error') {
        setIsOnboardingMissionCompleted(false);
        return;
      }
      setIsOnboardingMissionCompleted(Boolean(response.isAllMissionCompleted));
    };

    fetchMissionCompleted();

    return () => {
      isMounted = false;
    };
  }, [isNativeApp]);

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  // 利用可能なボーナスコースがある場合、真ん中のコース（4,900円）をボーナスコースに差し替え
  const availableBonusPackage = useMemo(
    () => getAvailableBonusPackage(creditPurchaseCourseInfo),
    [creditPurchaseCourseInfo],
  );

  const packagesWithBonus = useMemo(() => {
    if (!availableBonusPackage) return packages;

    const bonusMoney = availableBonusPackage.money;

    // ボーナスコースの金額が既存パッケージにある場合、そのパッケージを直接置き換え
    // これにより、同じ金額の通常コースとボーナスコースが重複表示されることを防ぐ
    const hasMatchingPackage = packages.some((pkg) => pkg.money === bonusMoney);

    if (hasMatchingPackage) {
      return packages.map((pkg) => {
        if (pkg.money === bonusMoney) {
          return {
            ...availableBonusPackage,
            isBonusExist: true,
          } as BonusPointPackage;
        }
        return pkg;
      });
    }

    // 同じ金額のパッケージがない場合は、popularMoneyのパッケージをボーナスに置き換え
    return packages.map((pkg) => {
      if (pkg.money === popularMoney) {
        return {
          ...availableBonusPackage,
          isBonusExist: true,
        } as BonusPointPackage;
      }
      return pkg;
    });
  }, [packages, availableBonusPackage, popularMoney]);

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // packagesWithBonusが更新されたら選択を初期化
  // ボーナスコースがある場合はその金額を選択、なければpopularMoneyを選択
  useEffect(() => {
    if (bonusInfoLoading) return;
    const targetMoney = availableBonusPackage?.money ?? popularMoney;
    const defaultPkg =
      packagesWithBonus.find((pkg) => pkg.money === targetMoney) ||
      packagesWithBonus[0] ||
      null;
    setSelectedPackage(defaultPkg);
  }, [
    packagesWithBonus,
    popularMoney,
    availableBonusPackage,
    bonusInfoLoading,
  ]);

  const [paymentStep, setPaymentStep] = useState<PaymentStep>('selection');

  const handlePurchase = () => {
    if (!selectedPackage || !session?.user?.token) return;

    const isUtage = separateApp();

    // Renkaユーザー: ネイティブ課金ページにリダイレクト（Apple Pay）
    if (!isUtage) {
      // Purchase Attribution: Renkaの場合
      if (sourceUiBase) {
        trackPurchaseIntent(sourceUiBase, PURCHASE_FLOW.RENKA);
      }
      window.location.href = `/${selectedPackage.packageId}`;
      return;
    }

    // Utageでクイックチャージ可能: 確認画面を表示
    if (canQuickCharge) {
      // Purchase Attribution: クイックチャージ
      if (sourceUiBase) {
        trackPurchaseIntent(sourceUiBase, PURCHASE_FLOW.QUICK_CHARGE);
      }
      setPaymentStep('confirm');
      return;
    }

    // Utageでクレカ未登録: Alvion決済ページに直接リダイレクト
    // Purchase Attribution: Alvion決済
    if (sourceUiBase) {
      trackPurchaseIntent(sourceUiBase, PURCHASE_FLOW.ALVION);
    }
    const alvionUrl = `${import.meta.env.VITE_ALVION_URL || 'https://localhost:3001'}/purchase/stripe-payment?sid=${encodeURIComponent(session.user.token)}&amount=${selectedPackage.money}&point=${selectedPackage.point}`;
    window.location.href = alvionUrl;
  };

  const handleFreePointClick = () => {
    onClose();
    window.location.href = '/onboarding';
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!portalContainer) return null;

  // 確認画面（クイックチャージ）
  if (paymentStep === 'confirm' && selectedPackage && session?.user?.token) {
    const token = session.user.token;
    // Alvion決済ページへのリダイレクト関数
    const redirectToAlvion = () => {
      // Purchase Attribution: 別のカードで購入（Alvion）に切り替え
      if (sourceUiBase) {
        trackPurchaseIntent(sourceUiBase, PURCHASE_FLOW.ALVION);
      }
      const alvionUrl = `${import.meta.env.VITE_ALVION_URL || 'https://localhost:3001'}/purchase/stripe-payment?sid=${encodeURIComponent(token)}&amount=${selectedPackage.money}&point=${selectedPackage.point}`;
      window.location.href = alvionUrl;
    };

    return createPortal(
      <BonusQuickChargeConfirmModal
        token={token}
        packageInfo={selectedPackage as BonusPointPackage}
        onClose={() => setPaymentStep('selection')}
        onSuccess={(addedPoints) => {
          updatePointOptimistic(addedPoints);
          showPurchaseSuccessToast(addedPoints);
          onPurchaseSuccess(addedPoints);
        }}
        onOpenPaymentModal={redirectToAlvion}
        {...(source !== undefined && { source })}
      />,
      portalContainer,
    );
  }

  // 選択画面
  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-end justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div
        className="max-h-[75vh] w-full max-w-md animate-slide-up overflow-hidden overflow-y-auto rounded-t-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー（カスタムコンテンツ） */}
        {headerContent}

        {/* メインコンテンツ */}
        <div className="bg-white px-5 py-4">
          {/* タイトル（hideTitle=trueの場合は非表示） */}
          {!hideTitle && (
            <div className="mb-1 flex items-center gap-2">
              <Icon size={24} className={iconClassName} />
              <h2 className="font-bold text-gray-900 text-lg">{t('title')}</h2>
            </div>
          )}

          {/* サブタイトル */}
          <div
            className={`mb-4 text-gray-500 text-sm ${hideTitle ? '' : 'ml-8'}`}
          >
            {subtitle}
          </div>

          {/* 価格選択リスト */}
          {bonusInfoLoading ? (
            <div className="flex animate-pulse flex-col gap-2" aria-busy="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`price-skeleton-${index}`}
                  className="h-14 w-full rounded-lg border border-gray-200 bg-gray-100"
                />
              ))}
            </div>
          ) : (
            <PriceSelector
              packages={packagesWithBonus}
              selectedPackage={selectedPackage}
              onSelect={setSelectedPackage}
              popularMoney={popularMoney}
              dealPoint={dealPoint || 0}
            />
          )}

          {/* 購入ボタン */}
          <button
            type="button"
            onClick={handlePurchase}
            disabled={!selectedPackage}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-pink-400 to-pink-500 py-3 font-bold text-base text-white transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buttonText}
          </button>

          {/* 無料でポイントを獲得する（Utageでオンボーディングミッション未完了の場合のみ表示） */}
          {separateApp() && isOnboardingMissionCompleted === false && (
            <button
              type="button"
              onClick={handleFreePointClick}
              className="mt-3 w-full py-2 text-gray-500 text-sm transition-colors hover:text-gray-700"
            >
              {t('getFreePoints')} &gt;
            </button>
          )}
        </div>
      </div>
    </div>,
    portalContainer,
  );
};

export default PointShortageModalBase;
