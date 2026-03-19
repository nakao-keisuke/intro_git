// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import { useEffect, useRef, useState } from 'react';
import type { OnboardingMissionResponseData } from '@/apis/onboarding-mission';
import { isAllMissionCompleted } from '@/apis/onboarding-mission';
import { HTTP_GET_UTAGE_ONBOARDING_MISSION_PROGRESS } from '@/constants/endpoints';
import { useNotifyPointShortage } from '@/hooks/requests/useNotifyPointShortage';
import { useGetCreditPurchaseCourseInfo } from '@/hooks/useGetCreditPurchaseCourseInfo.hook';
import { useNavigateWithOrigin } from '@/hooks/useNavigateWithOrigin';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { isPWA } from '@/libs/isPWA';
import styles from '@/styles/PayNoModal.module.css';
import type { Banner } from '@/types/Banner';
import type { DeviceCategory } from '@/types/DeviceCategory';
import type { ResponseData } from '@/types/NextApi';
import AppBannerCard from './AppBannerCard';

const girlPic = '/tuto/phone_girl.webp';

import { IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';
import AlvionQuickChargeModal from '@/components/purchase/AlvionQuickChargeModal';
import { isNativeApplication } from '@/constants/applicationId';
import { usePaymentStore } from '@/stores/paymentStore';
import { usePointStore } from '@/stores/pointStore';
import { useUIStore } from '@/stores/uiStore';

type Props = {
  onClose: () => void;
  offsetClassName?: string;
};

// Page Router 版の挙動を踏襲した App Router 版 PayNoModal
export default function AppPayNoModal({
  onClose,
  offsetClassName = '',
}: Props) {
  const nav = useNavigateWithOrigin();
  const router = useRouter();
  const { data: session } = useSession();
  const { creditPurchaseCourseInfo, loading: bonusInfoLoading } =
    useGetCreditPurchaseCourseInfo();

  // ネイティブアプリ判定
  const isNativeApp = isNativeApplication();

  // クイックチャージ可否をZustandから取得
  const canQuickCharge = usePaymentStore((s) => s.canQuickCharge);

  const updatePointOptimistic = usePointStore((s) => s.updatePointOptimistic);

  // クイックチャージ用の状態
  const [showQuickChargeModal, setShowQuickChargeModal] = useState(false);

  // クイックチャージ成功処理
  const handleQuickChargeSuccess = (addedPoints: number) => {
    updatePointOptimistic(addedPoints);
    toast(
      <div
        className="inline-flex items-center"
        style={{ verticalAlign: 'middle' }}
      >
        <Image
          src="/images/purchase_check_icon.webp"
          alt="購入完了"
          className="h-8 w-8"
          style={{ marginRight: '0.5em', verticalAlign: 'middle' }}
        />
        <span style={{ verticalAlign: 'middle', lineHeight: '32px' }}>
          {addedPoints}ポイントを購入しました。
        </span>
      </div>,
      {
        theme: 'light',
        className: 'bg-white',
        hideProgressBar: false,
        autoClose: 3000,
      },
    );
    setShowQuickChargeModal(false);
    onClose();
  };

  // 自動判定: クイックチャージ可能ユーザーは直接AlvionQuickChargeModalを表示
  useEffect(() => {
    if (canQuickCharge) {
      setShowQuickChargeModal(true);
    }
  }, [canQuickCharge]);

  // 端末カテゴリ（バナー描画用）
  const isPC = useUIStore((s) => s.isPC);
  const deviceCategory: DeviceCategory = isPC ? 'desktop' : 'mobile';

  // ミッション進捗（3秒タイムアウト + キャッシュ）
  const [missionProgress, setMissionProgress] =
    useState<OnboardingMissionResponseData | null>(null);
  const [loadingMission, setLoadingMission] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const missionProgressCacheRef = useRef<{
    token: string;
    data: OnboardingMissionResponseData;
    timestamp: number;
  } | null>(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5分

  // アクション: 購入導線（ボーナス優先）
  const goPurchase = () => {
    onClose();
    nav.push(
      '/purchase?source=pay_no_modal',
      nav.originFromModal('pay-no:continue'),
    );
  };

  const goOnboarding = () => {
    onClose();
    router.push('/onboarding');
  };
  const goNormalPurchase = () => {
    onClose();
    nav.push(
      '/purchase?source=pay_no_modal',
      nav.originFromModal('pay-no:purchase'),
    );
  };

  // ポイント不足通知フックを使用
  const { notify } = useNotifyPointShortage();

  // 起動ログ: 不足時イベント送信（同等挙動）
  useEffect(() => {
    const sendLog = async () => {
      if (session?.user?.id && session?.user?.token) {
        await notify();
      }
    };
    sendLog();
  }, [session, notify]);

  // ミッション取得（キャッシュ + タイムアウト）
  useEffect(() => {
    const fetchMission = async () => {
      if (!session?.user?.token) return;

      const now = Date.now();
      const cache = missionProgressCacheRef.current;
      if (
        cache &&
        cache.token === session.user.token &&
        now - cache.timestamp < CACHE_DURATION
      ) {
        setMissionProgress(cache.data);
        return;
      }

      setLoadingMission(true);
      try {
        const client = new ClientHttpClient();
        const res = await client.post<
          ResponseData<OnboardingMissionResponseData>
        >(HTTP_GET_UTAGE_ONBOARDING_MISSION_PROGRESS, {
          isPwa: isPWA(),
        });
        if (res.type === 'success') {
          setMissionProgress(res);
          missionProgressCacheRef.current = {
            token: session.user.token,
            data: res,
            timestamp: now,
          };
        }
      } catch (_e) {
        // noop
      } finally {
        setLoadingMission(false);
      }
    };
    fetchMission();
  }, [session]);

  // タイムアウト制御
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setIsTimeout(true);
      setIsDataReady(true);
    }, 3000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // データ準備完了判定
  useEffect(() => {
    const creditReady = creditPurchaseCourseInfo !== undefined;
    const missionReady = !loadingMission;
    if (creditReady && missionReady && !isTimeout) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsDataReady(true);
    }
  }, [creditPurchaseCourseInfo, loadingMission, isTimeout]);

  if (!isDataReady) return null;

  // バナー
  let bonusBanner: Banner | null = null;
  if (creditPurchaseCourseInfo) {
    if (creditPurchaseCourseInfo.canBuyFirstBonusCourse) {
      bonusBanner = { id: 'purchasezeroth', path: '/purchase' };
    } else if (creditPurchaseCourseInfo.canBuySecondBonusCourse) {
      bonusBanner = { id: 'purchasefirst', path: '/purchase' };
    } else if (creditPurchaseCourseInfo.canBuyThirdBonusCourse) {
      bonusBanner = { id: 'purchasesecond', path: '/purchase' };
    } else if (creditPurchaseCourseInfo.canBuyFourthBonusCourse) {
      bonusBanner = { id: 'purchasethird', path: '/purchase' };
    }
  }

  const isMissionNotCompleted =
    !isTimeout && missionProgress && !isAllMissionCompleted(missionProgress);
  const onboardingBanner: Banner = {
    id: 'missioncompleted',
    path: '/onboarding',
  };

  return (
    <div className="fixed inset-0 z-[2147483647]">
      {!showQuickChargeModal && (
        <div
          className={`flex h-full w-full items-center justify-center ${offsetClassName}`}
          aria-modal
          onClick={onClose}
        >
          <div
            className="w-[98%] max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-2 ring-black/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-5 pt-5 pb-3">
              <h3 className="text-center font-semibold text-[17px] text-gray-900">
                ポイントが不足しています！
              </h3>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 rounded-full p-1 transition-colors hover:bg-gray-100"
                aria-label="閉じる"
              >
                <IconX size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
              {isMissionNotCompleted ? (
                <div className="space-y-4">
                  {!isNativeApp && (
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <AppBannerCard
                        banner={onboardingBanner}
                        index={0}
                        deviceCategory={deviceCategory}
                      />
                    </div>
                  )}
                  <div
                    className={
                      isNativeApp
                        ? 'flex justify-center'
                        : 'grid grid-cols-2 gap-2'
                    }
                  >
                    <button
                      onClick={goNormalPurchase}
                      className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-pink-300 to-pink-300 px-4 py-2.5 font-semibold text-sm text-white transition-all duration-300 hover:from-pink-500 hover:to-pink-600"
                    >
                      ポイント購入
                    </button>
                    {!isNativeApp && (
                      <button
                        onClick={goOnboarding}
                        className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-green-400 to-green-500 px-4 py-2.5 text-center font-semibold text-sm text-white leading-tight transition-all duration-300 hover:from-green-500 hover:to-green-600"
                      >
                        <span className="block font-bold text-[1.05em]">
                          無料で
                        </span>
                        <span>ポイント獲得</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : !isTimeout && bonusBanner ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl border border-gray-200 p-3">
                    <div className={`${styles.ribbon}`}>あなた限定</div>
                    <div className="text-center font-semibold text-[15px] text-red-600 underline decoration-double">
                      今だけの特別クーポン
                    </div>
                    <div className="mt-2 overflow-hidden rounded-lg">
                      <AppBannerCard
                        banner={bonusBanner}
                        index={0}
                        deviceCategory={deviceCategory}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-md px-4 py-2.5 font-semibold text-red-600 text-sm ring-1 ring-gray-200 hover:bg-gray-50"
                    >
                      あとで
                    </button>
                    <button
                      onClick={goPurchase}
                      className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2.5 font-semibold text-sm text-white hover:opacity-95 active:opacity-90"
                    >
                      続ける
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl">
                    {/* Keep legacy visual for Paidy message but wrap with modern spacing */}
                    <div className={styles.backGround}>
                      <div className={styles.girl}>
                        <div className={styles.message}>
                          Paidyなら
                          <br />
                          簡単<span className={styles.color}>あと払い購入</span>
                          <br />
                          支払いは<span className={styles.color}>翌月</span>
                          でOK!!
                        </div>
                        <Image
                          src={girlPic}
                          width={150}
                          height={190}
                          alt="女性"
                          className={styles.girlPic}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-md px-4 py-2.5 font-semibold text-gray-700 text-sm ring-1 ring-gray-200 hover:bg-gray-50"
                    >
                      あとで
                    </button>
                    <button
                      onClick={goPurchase}
                      className="inline-flex items-center justify-center rounded-md bg-[#F10104] px-4 py-2.5 font-semibold text-sm text-white hover:opacity-95 active:opacity-90"
                    >
                      続ける
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* AlvionQuickChargeModal */}
      {showQuickChargeModal && session?.user?.token && (
        <AlvionQuickChargeModal
          token={session.user.token}
          onClose={() => onClose()}
          onSuccess={handleQuickChargeSuccess}
          title="ポイントが不足しています"
          hideLowestPackage={true}
          source="pay_no_modal"
        />
      )}
    </div>
  );
}
