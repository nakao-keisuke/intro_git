// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';

const pointPic = '/g_point.webp';

import { useSession } from '#/hooks/useSession';
// TODO: i18n - import { useTranslations } from '#/i18n';
import { useEffect, useState } from 'react';
import AlvionQuickChargeModal from '@/components/purchase/AlvionQuickChargeModal';
import { PRICING_INFO } from '@/constants/pricing';
import { useBookmarkListService } from '@/hooks/useBookmarkListService';
import { useGetMyInfo } from '@/hooks/useGetMyInfo.hook';
import { usePaymentCustomerData } from '@/hooks/usePaymentCustomerData.hook';
import { useMyPoint } from '@/hooks/usePollingData';
import { usePurchaseAttribution } from '@/hooks/usePurchaseAttribution';
import type { BookmarkListUserInfo } from '@/services/bookmark-list/type';
import { useCallStore } from '@/stores/callStore';
import { usePointStore } from '@/stores/pointStore';
import { useUIStore } from '@/stores/uiStore';
import { PURCHASE_FLOW } from '@/types/purchaseAttribution';
import { beforeCall } from '@/utils/callState';
import { showPurchaseSuccessToast } from '@/utils/purchaseToast';
import BookmarkUserItem from './sidebar/BookmarkUserItem';

const PCSidebar = () => {
  const callState = useCallStore((s) => s.callState);
  const t = useTranslations('sidebar');
  const tPricing = useTranslations('pricing');
  const { data: session, status } = useSession();
  const { myUserInfo } = useGetMyInfo();
  const bookmarkListService = useBookmarkListService();
  const [bookmarkUsers, setBookmarkUsers] = useState<BookmarkListUserInfo[]>(
    [],
  );
  const myPoint = usePointStore((s) => s.currentPoint);
  const { canQuickCharge } = usePaymentCustomerData();
  const [showQuickChargeModal, setShowQuickChargeModal] = useState(false);
  const syncWithPolling = usePointStore((s) => s.syncWithPolling);
  const updatePointOptimistic = usePointStore((s) => s.updatePointOptimistic);
  const myPointData = useMyPoint();
  const { trackPurchaseIntent } = usePurchaseAttribution();
  const isPC = useUIStore((s) => s.isPC);

  // ポーリングデータでcurrentPointを同期（3秒ごと）
  useEffect(() => {
    if (myPointData?.data?.point !== undefined) {
      syncWithPolling(myPointData.data.point);
    }
  }, [myPointData?.updatedAt, syncWithPolling]);

  useEffect(() => {
    const fetchBookmarkUsers = async () => {
      if (!isPC || status === 'loading' || status === 'unauthenticated') {
        return;
      }

      try {
        const { bookmarkList } = await bookmarkListService.getInitialData();
        const sortedList = bookmarkList
          .sort((a, b) =>
            (b.lastLoginTime || '').localeCompare(a.lastLoginTime || ''),
          )
          .slice(0, 3);
        setBookmarkUsers(sortedList);
      } catch (_err) {
        setBookmarkUsers([]);
      }
    };

    fetchBookmarkUsers();
  }, [isPC, status, bookmarkListService]);

  // クイックチャージ成功時の処理
  const handleQuickChargeSuccess = (addedPoints: number) => {
    updatePointOptimistic(addedPoints);
    showPurchaseSuccessToast(addedPoints);
    setShowQuickChargeModal(false);
  };

  // チャージボタンクリック時の処理
  const handleChargeClick = () => {
    setShowQuickChargeModal(true);
  };

  if (callState !== beforeCall) return null;

  const sidebarPricingInfo = PRICING_INFO.filter(
    (item) => item.showOnPcSidebar,
  );

  return (
    <aside className="fixed top-[90px] left-0 z-[100] h-[calc(100vh-90px)] w-64 overflow-y-auto bg-gray-50 shadow-md max-md:hidden scrollbar-hidden">
      <div className="p-5 pt-5">
        {/* ユーザー名表示 */}
        {session && (
          <div className="mb-3 ml-2.5 font-bold text-gray-600 text-sm">
            {t('userGreeting', { name: myUserInfo?.userName || t('guest') })}
          </div>
        )}

        {/* ログイン/マイページボタン */}
        {!session ? (
          <Link
            href="/login"
            className="mx-auto mb-3 block w-11/12 rounded-md bg-pink-500 px-2.5 py-3 text-center font-bold text-white text-xs no-underline transition-all duration-200 hover:opacity-80"
          >
            {t('loginButton')}
          </Link>
        ) : (
          <Link
            href="/my-page"
            className="mx-auto mb-3 block w-11/12 rounded-md border border-gray-300 bg-white px-2.5 py-3 text-center font-bold text-gray-700 text-xs no-underline transition-all duration-200 hover:opacity-80"
          >
            {t('myPageButton')}
          </Link>
        )}

        {/* 現在のポイント */}
        {session && (
          <>
            <div className="mt-5 mb-2.5 ml-2.5 font-bold text-gray-600 text-sm">
              {t('currentPoints')}
            </div>
            <div className="mx-auto my-2.5 w-11/12 rounded-lg bg-white px-2.5 py-2.5 text-[11px] text-pink-500 shadow-sm">
              <div className="flex items-center justify-between px-2.5 py-2">
                <Image
                  src={pointPic}
                  alt={t('pointIconAlt')}
                  width={30}
                  height={30}
                  className="mr-1.5"
                />
                <div className="font-bold text-2xl text-gray-600">
                  {myPoint ?? 0}
                  <span className="font-bold text-gray-600 text-xs"> pt</span>
                </div>
              </div>
            </div>
            {/* ポイントチャージボタン */}
            {canQuickCharge ? (
              <button
                onClick={handleChargeClick}
                className="mx-auto mb-5 block w-11/12 cursor-pointer rounded-md border-none bg-red-500 px-2.5 py-3 text-center text-white text-xs shadow-[0_-2px_0_rgba(127,29,29,0.5)_inset] transition-all duration-200 hover:opacity-80"
              >
                <div className="flex items-center justify-center whitespace-nowrap">
                  {t('chargePoints')}
                </div>
              </button>
            ) : (
              <Link
                href="/purchase?source=header"
                className="mx-auto mb-5 block w-11/12 rounded-md bg-sky-400 px-2.5 py-3 text-center text-white text-xs no-underline shadow-[0_-2px_0_rgb(7_89_133)_inset] transition-all duration-200 hover:opacity-80"
                onClick={() =>
                  trackPurchaseIntent(
                    'sidebar.point_purchase_button',
                    PURCHASE_FLOW.PURCHASE_PAGE,
                  )
                }
              >
                <div className="flex items-center justify-center whitespace-nowrap">
                  {t('chargePoints')}
                </div>
              </Link>
            )}
          </>
        )}

        {sidebarPricingInfo.length > 0 && (
          <>
            {/* 料金説明 */}
            <div className="mt-5 mb-2.5 ml-2.5 font-bold text-gray-600 text-sm">
              {t('pointConsumption')}
            </div>

            {/* 料金リスト */}
            <div className="mx-auto my-2.5 w-11/12 rounded-lg bg-white px-2.5 py-2.5 text-[11px] text-pink-500 shadow-sm">
              {sidebarPricingInfo.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-2.5 py-2 ${
                    index < sidebarPricingInfo.length - 1
                      ? 'border-gray-200 border-b'
                      : 'pb-1.5'
                  }`}
                >
                  {tPricing(item.labelKey)}
                  <span className="font-bold text-gray-600 text-sm">
                    {typeof item.price === 'number'
                      ? item.price
                      : tPricing('free')}
                    <span className="font-bold text-gray-600 text-xs">
                      {item.unitKey ? tPricing(item.unitKey) : ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* 詳細リンク */}
            <div className="mt-2.5 mr-5 text-right text-gray-600 text-xs">
              <Link
                href="/point-howto"
                className="text-gray-600 no-underline transition-all duration-300 hover:opacity-60"
              >
                {t('pointDetails')}&gt;
              </Link>
            </div>
          </>
        )}

        {/* お気に入りユーザーセクション */}
        {session && (
          <div className="my-5 px-2.5">
            <div className="mb-2.5 font-bold text-gray-600 text-sm">
              {t('favoriteUsers')}
            </div>
            {bookmarkUsers.length > 0 ? (
              <>
                <div className="flex flex-col gap-2.5">
                  {bookmarkUsers.map((user) => (
                    <BookmarkUserItem key={user.userId} user={user} />
                  ))}
                </div>
                <div className="mt-2.5 text-right text-xs">
                  <Link
                    href="/bookmark-list"
                    className="text-gray-600 no-underline transition-all duration-300 hover:opacity-60"
                  >
                    {t('seeMore')} &gt;
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-gray-100 p-3 text-center text-gray-500 text-xs leading-relaxed">
                {t('favoriteEmptyMessage')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* クイックチャージモーダル */}
      {showQuickChargeModal && session?.user?.token && (
        <AlvionQuickChargeModal
          token={session.user.token}
          onClose={() => setShowQuickChargeModal(false)}
          onSuccess={handleQuickChargeSuccess}
          source="header"
        />
      )}
    </aside>
  );
};

export default PCSidebar;
