// Image component removed (use <img> directly);
import { usePathname, useRouter } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import type React from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  getApplicationId,
  isNativeApplication,
} from '@/constants/applicationId';
import { useGetMyInfo } from '@/hooks/useGetMyInfo.hook';
import { useUnreadCount } from '@/hooks/usePollingData';
import { native } from '@/libs/nativeBridge';
import { useCallStore } from '@/stores/callStore';
import styles from '@/styles/BottomNavigation.module.css';
import { inCall } from '@/utils/callState';
import { getCurrentDateInJapan } from '@/utils/timeUti';

type NavItem = {
  href: string;
  icon: string;
  label: string;
  showBadge?: boolean;
  badgeCount?: number | undefined;
};

const BottomNavigation = forwardRef((_props, _ref) => {
  const callState = useCallStore((s) => s.callState);
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname;
  const unreadCountData = useUnreadCount();
  const { data: session, update, status } = useSession();
  const { isLoginUser } = useGetMyInfo();
  const [isUpdating, setIsUpdating] = useState(false);
  const hasAutoLoginAttempted = useRef(false);
  const [isLogout, setIsLogout] = useState<boolean | undefined>(undefined);
  const [showBoardBadge, setShowBoardBadge] = useState(false);
  const [showRankingBadge, setShowRankingBadge] = useState(false);
  const [_showFootprintBadge, setShowFootprintBadge] = useState(false);
  const [showGalleryBadge, setShowGalleryBadge] = useState(false);
  // ページ遷移時のバッジ更新処理
  const updateBadgeStatus = (path: string) => {
    const currentDate = getCurrentDateInJapan();

    switch (path) {
      case '/board':
        localStorage.setItem('lastBoardPageOpenedDate', currentDate);
        setShowBoardBadge(false);
        break;
      case '/ranking':
        localStorage.setItem('lastRankingPageOpenedDate', currentDate);
        setShowRankingBadge(false);
        break;
      case '/footprint-list':
        localStorage.setItem('lastFootprintPageOpenedDate', currentDate);
        setShowFootprintBadge(false);
        break;
    }
  };

  // 現在のパスの変更を監視して、バッジ状態を更新
  useEffect(() => {
    if (currentPath) {
      updateBadgeStatus(currentPath);
    }
  }, [currentPath]);

  // バッジの初期状態の設定
  useEffect(() => {
    const currentDate = getCurrentDateInJapan();

    setShowBoardBadge(
      localStorage.getItem('lastBoardPageOpenedDate') !== currentDate,
    );

    setShowRankingBadge(
      localStorage.getItem('lastRankingPageOpenedDate') !== currentDate,
    );

    setShowFootprintBadge(
      localStorage.getItem('lastFootprintPageOpenedDate') !== currentDate,
    );

    setShowGalleryBadge(
      localStorage.getItem('lastGalleryPageOpenedDate') !== currentDate,
    );
  }, []);

  // AutoLogin処理
  // token切れが定期的に発生するため、タブが変更された際に自動ログインを行う
  // 1回のみ実行し、失敗してもリトライしない（ループ防止）
  useEffect(() => {
    if (status === 'authenticated' && session) {
      setIsLogout(session.user.isLogout);
      if (isUpdating || hasAutoLoginAttempted.current) return;
      hasAutoLoginAttempted.current = true;
      setIsUpdating(true);
      native
        .getDeviceLangAndIdfv()
        .then(({ lang, idfv }) =>
          update({
            type: 'autoLogin',
            applicationId: getApplicationId(),
            lang,
            ...(idfv ? { idfv } : {}),
          }),
        )
        .finally(() => setIsUpdating(false));
    }
  }, [status, session]);

  // 通話中の場合は、ボタンを非活性にする
  if (callState === inCall) return <div></div>;

  // アクティブなページを判定するための変数
  const isActive = (path: string) => currentPath === path;

  const navItems: NavItem[] = [
    {
      href: '/',
      icon: '/bottom_navigation.icon/search.icon.webp',
      label: 'さがす',
    },
    {
      href: '/conversation',
      icon: '/bottom_navigation.icon/message.icon.webp',
      label: 'メッセージ',
      badgeCount: unreadCountData?.data,
    },
    {
      href: '/board',
      icon: '/bottom_navigation.icon/board.icon.webp',
      label: '掲示板',
      showBadge: showBoardBadge,
    },
    {
      href: '/gallery',
      icon: '/bottom_navigation.icon/pic.icon.webp',
      label: '動画・画像',
      showBadge: showGalleryBadge,
    },
    {
      href: '/my-page',
      icon: '/bottom_navigation.icon/profile.icon.webp',
      label: 'マイページ',
      showBadge: isLogout === false && showRankingBadge,
    },
  ];

  // Pages that don't require authentication - defined as constant to avoid duplication
  const GUEST_ALLOWED_PAGES = ['/board', '/gallery', '/timeline/list'];

  // Handle navigation with authentication check
  const handleNavigation = (href: string, event: React.MouseEvent) => {
    event.preventDefault();

    // Check if authentication is required for this page
    if (!isLoginUser && !GUEST_ALLOWED_PAGES.includes(href)) {
      router.push(isNativeApplication() ? '/signup?app=native' : '/signup');
      return;
    }

    updateBadgeStatus(href);
    router.push(href);
  };

  // Check if navigation item is disabled for guest users
  const isDisabled = (href: string) => {
    // Only disable if explicitly confirmed as not logged in
    return isLoginUser === false && !GUEST_ALLOWED_PAGES.includes(href);
  };

  return (
    <div className={`${styles.container}`}>
      {navItems.map((item) => {
        const disabled = isDisabled(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => handleNavigation(item.href, e)}
            style={{
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontWeight: isActive(item.href) ? 'bold' : 'normal',
            }}
            className={`${styles.item} ${isActive(item.href) ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
          >
            <div>
              {!disabled &&
                item.badgeCount !== undefined &&
                item.badgeCount > 0 && (
                  <span className={styles.unreadCount}>
                    {item.badgeCount < 100 ? item.badgeCount : '+99'}
                  </span>
                )}
              {disabled && <div className={styles.unlockText}>登録で解放</div>}
              <Image
                src={item.icon}
                alt={`${item.label}アイコン`}
                width={26}
                height={26}
                priority
              />
              {!disabled && item.showBadge && (
                <span className={styles.badge}>●</span>
              )}
              <br />
              <span>{item.label}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
});

BottomNavigation.displayName = 'BottomNavigation';

export default BottomNavigation;
