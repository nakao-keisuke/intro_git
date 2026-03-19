// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import { usePathname, useRouter } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
// TODO: i18n - import { useTranslations } from '#/i18n';
import { useEffect, useRef, useState } from 'react';
import {
  getApplicationId,
  isNativeApplication,
} from '@/constants/applicationId';
import { getNativeBrandByApplicationId } from '@/constants/nativeBrand';
import { useNavigateWithOrigin } from '@/hooks/useNavigateWithOrigin';
import { useMyPoint } from '@/hooks/usePollingData';
import { usePurchaseAttribution } from '@/hooks/usePurchaseAttribution';
import { useSaleLabel } from '@/hooks/useSaleLabel';
import { notoSansJP } from '@/libs/fonts';
import { usePointStore } from '@/stores/pointStore';
import { useUIStore } from '@/stores/uiStore';
import { PURCHASE_FLOW } from '@/types/purchaseAttribution';
import { getCurrentDateInJapan } from '@/utils/timeUti';
import { useHeaderVisibility } from './HeaderVisibilityContext';

type NavItem = {
  href: string;
  icon: string;
  label: string;
  showSaleBadge?: boolean;
  showBadge?: boolean;
};

type HeaderNavigationProps = {
  /** trueの場合position: fixed、falseの場合通常のドキュメントフロー */
  fixed?: boolean;
};

export default function HeaderNavigation({
  fixed = true,
}: HeaderNavigationProps) {
  const { status } = useSession();
  const router = useRouter();
  const nav = useNavigateWithOrigin();
  const { isHeaderHidden } = useHeaderVisibility();
  const isPC = useUIStore((s) => s.isPC);
  const t = useTranslations('header');

  const shouldShowSaleLabel = useSaleLabel();
  const currentPointValue = usePointStore((s) => s.currentPoint);
  const syncWithPolling = usePointStore((s) => s.syncWithPolling);
  const myPointData = useMyPoint();
  const { trackPurchaseIntent } = usePurchaseAttribution();

  // ポイントアニメーション制御
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const prevPointRef = useRef<number | null>(null);

  // ギャラリーバッジの状態管理
  const [showGalleryBadge, setShowGalleryBadge] = useState(false);

  useEffect(() => {
    // アプリ起動時のアニメーション
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);

    return () => clearTimeout(timer);
  }, []); // 空の依存配列でマウント時にのみ実行

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    // ポイントが増加した時のアニメーション
    if (
      prevPointRef.current !== null &&
      currentPointValue > prevPointRef.current
    ) {
      setIsAnimating(true);
      setAnimationKey((prev) => prev + 1);

      // アニメーション終了後にクラスを削除
      timer = setTimeout(() => setIsAnimating(false), 500);
    }
    prevPointRef.current = currentPointValue;

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentPointValue]);

  // ↓ ApplicationIDがネイティブ（iOS: 72, Android: 76）かどうかを判定
  const isNativeApp = isNativeApplication();
  const currentBrand = getNativeBrandByApplicationId(getApplicationId());

  // NextAuthのセッション状態から認証状態を判定
  const isUnauthenticated = status === 'unauthenticated';

  // ページ遷移時のバッジ更新処理
  const updateBadgeStatus = (path: string) => {
    const currentDate = getCurrentDateInJapan();

    if (path === '/gallery') {
      localStorage.setItem('lastGalleryPageOpenedDate', currentDate);
      setShowGalleryBadge(false);
    }
  };

  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  // 現在のパスの変更を監視して、バッジ状態を更新
  useEffect(() => {
    if (pathname) {
      updateBadgeStatus(pathname);
    }
  }, [pathname]);

  // バッジの初期状態の設定
  useEffect(() => {
    const currentDate = getCurrentDateInJapan();

    setShowGalleryBadge(
      localStorage.getItem('lastGalleryPageOpenedDate') !== currentDate,
    );
  }, []);

  // ポーリングデータでcurrentPointを同期（3秒ごと）
  useEffect(() => {
    if (myPointData?.data?.point !== undefined) {
      syncWithPolling(myPointData.data.point);
    }
  }, [myPointData?.updatedAt, syncWithPolling]);

  if (
    pathname?.startsWith('/column') ||
    pathname?.startsWith('/fleamarket/item')
  ) {
    return null;
  }

  // ローディング中は何も表示しない
  if (status === 'loading') {
    return null;
  }

  // PC用ナビゲーション
  const pcNavItems: NavItem[] = [
    {
      href: '/footprint-list',
      icon: '/bottom_navigation.icon/footprint.icon.webp',
      label: t('footprint'),
    },
    {
      href: '/notification',
      icon: '/header/notification.webp',
      label: t('notifications'),
    },
    {
      href: '/purchase?source=header',
      icon: '/bottom_navigation.icon/point.icon.webp',
      label: t('points'),
      showSaleBadge: !isUnauthenticated && shouldShowSaleLabel,
    },
    {
      href: '/search',
      icon: '/bottom_navigation.icon/search.icon.webp',
      label: t('search'),
    },
    {
      href: '/my-page',
      icon: '/bottom_navigation.icon/profile.icon.webp',
      label: t('myPage'),
    },
  ];

  // モバイル用ナビゲーション（ポイントは保有ポイントピルで表示するため除外）
  const mobileNavItems: NavItem[] = [
    {
      href: '/footprint-list',
      icon: '/bottom_navigation.icon/footprint.icon.webp',
      label: t('footprint'),
    },
    {
      href: '/gallery',
      icon: '/bottom_navigation.icon/pic.icon.webp',
      label: t('gallery'),
      showBadge: showGalleryBadge,
    },
    {
      href: '/search',
      icon: '/bottom_navigation.icon/search.icon.webp',
      label: t('search'),
    },
  ];

  const navItems = isPC ? pcNavItems : mobileNavItems;

  // fixedモードの場合のみスクロールアウト制御を適用
  const headerStyle = fixed
    ? {
        transform:
          !isPC && isHeaderHidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 300ms ease-in-out',
      }
    : {};

  const headerClassName = fixed
    ? `fixed top-0 right-0 left-0 z-[99999] w-full ${notoSansJP.className}`
    : `relative w-full ${notoSansJP.className}`;

  return (
    <header style={headerStyle} className={headerClassName}>
      <div className="flex h-[50px] w-full items-center bg-white">
        {isNativeApp ? (
          // ネイティブアプリの場合：ログイン済みならgirls/all、未ログインならsignup
          <Link href={isUnauthenticated ? '/signup?app=native' : '/girls/all'}>
            <div className="px-4 text-center">
              <Image
                src={currentBrand.logoPath}
                alt={currentBrand.logoAlt}
                width={90}
                height={50}
                className={currentBrand.logoClass}
                priority={true}
                loading="eager"
              />
            </div>
          </Link>
        ) : (
          <Link href="/">
            <div className="px-4 text-center">
              <Image
                src={currentBrand.logoPath}
                alt={currentBrand.logoAlt}
                width={90}
                height={50}
                className={currentBrand.logoClass}
                priority={true}
                loading="eager"
              />
            </div>
          </Link>
        )}

        {isUnauthenticated && !isNativeApp && (
          <Link
            href="/signup"
            className={`cursor-pointer rounded-md border-2 border-red-500 shadow-sm ${isPC ? 'mr-2 ml-auto' : 'absolute right-2'}`}
          >
            <p className="flex p-1 text-center font-bold text-xs">
              {t('freeRegistration')}
            </p>
          </Link>
        )}

        {!isUnauthenticated && (
          <div
            className={`flex h-full items-center ${isPC ? 'ml-auto pr-2' : 'ml-auto gap-1 pr-2'}`}
          >
            <div
              className={`flex h-full items-center ${isPC ? 'ml-auto justify-end gap-3' : 'gap-1'}`}
            >
              {navItems.map((item) => {
                return (
                  <div
                    key={item.label}
                    className={`relative flex h-full flex-col items-center justify-center text-center text-[10px] text-gray-500 no-underline hover:bg-[#d1d1d1] ${isPC ? 'px-3' : 'px-2'}`}
                  >
                    {item.href === '/search' ? (
                      <button
                        onClick={() => router.push('/search')}
                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center"
                      >
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={25}
                          height={25}
                          priority
                          loading="eager"
                        />
                        <span>{item.label}</span>
                      </button>
                    ) : item.href.startsWith('/purchase') ? (
                      <button
                        onClick={() =>
                          nav.push(
                            item.href,
                            nav.originFromHeader('header-nav:purchase'),
                          )
                        }
                        className={`flex h-full w-full cursor-pointer flex-col items-center justify-center ${isActive(item.href) ? 'font-bold text-[#42BFEC]' : ''}`}
                      >
                        <div className="relative">
                          <Image
                            src={item.icon}
                            alt={item.label}
                            width={25}
                            height={25}
                            priority
                            loading="eager"
                          />
                          {/* ポイントタブにSALEラベルを表示 */}
                          {item.showSaleBadge && (
                            <span className="absolute -top-1 -right-5 rounded-sm bg-red-500 px-1 py-0.5 font-bold text-[8px] text-white shadow-md">
                              SALE
                            </span>
                          )}
                        </div>
                        <span>{item.label}</span>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        prefetch={
                          item.href !== '/footprint-list' &&
                          item.href !== '/gallery'
                        }
                        className={`flex h-full w-full cursor-pointer flex-col items-center justify-center ${isActive(item.href) ? 'font-bold text-[#42BFEC]' : ''}`}
                        onClick={() => {
                          if (item.href.startsWith('/purchase')) {
                            // ヘッダーからのポイント購入導線を起点トラッキング
                            trackPurchaseIntent(
                              'header.point_purchase_button',
                              PURCHASE_FLOW.PURCHASE_PAGE,
                            );
                          }
                        }}
                      >
                        <div className="relative">
                          <Image
                            src={item.icon}
                            alt={item.label}
                            width={25}
                            height={25}
                            priority
                            loading="eager"
                          />
                          {/* ポイントタブにSALEラベルを表示 */}
                          {item.showSaleBadge && (
                            <span className="absolute -top-1 -right-5 rounded-sm bg-red-500 px-1 py-0.5 font-bold text-[8px] text-white shadow-md">
                              SALE
                            </span>
                          )}
                          {/* バッジ表示 */}
                          {item.showBadge && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 font-bold text-[8px] text-white"></span>
                          )}
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {/* モバイル専用の保有ポイントピルをヘッダー右側に配置 */}
            {!isPC && (
              <Link
                href="/purchase?source=header"
                key={animationKey}
                onClick={() => {
                  // モバイルの保有ポイントピルからの導線
                  trackPurchaseIntent(
                    'header.point_purchase_button',
                    PURCHASE_FLOW.PURCHASE_PAGE,
                  );
                }}
              >
                {/* SALEラベル */}
                {shouldShowSaleLabel && (
                  <span className="absolute -top-0.25 right-2 z-10 rounded-sm bg-red-500 px-1 py-0.5 font-bold text-[8px] text-white shadow-md">
                    SALE
                  </span>
                )}
                <span
                  className={`point-background flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ffd54f] via-[#ffc107] to-[#ffb300] px-1.5 py-1.5 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08),0_6px_14px_rgba(255,179,0,0.4)] ${isAnimating ? 'animating' : ''}`}
                >
                  <span
                    className={`point-icon grid h-3 w-3 place-items-center rounded-full bg-white/95 font-extrabold text-[#ff9800] text-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.08)] ring-1 ring-white/80 ${isAnimating ? 'animating' : ''}`}
                  >
                    P
                  </span>
                  <span
                    className={`point-text font-bold text-[16px] text-white tabular-nums tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)] ${isAnimating ? 'animating' : ''}`}
                  >
                    {(currentPointValue ?? 0).toLocaleString('ja-JP')}
                  </span>
                  <span className="grid h-4 w-4 place-items-center rounded-md bg-white/90 font-extrabold text-[#ff9800] text-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.08)] ring-1 ring-white/80">
                    ＋
                  </span>
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
