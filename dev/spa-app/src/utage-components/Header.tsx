// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import styles from '@/styles/Header.module.css';

const logoPic = '/header/utage_logo.webp';

import { useGetMyInfo } from '@/hooks/useGetMyInfo.hook';
import { useCallStore } from '@/stores/callStore';
import { inCall } from '@/utils/callState';
import MeetPeopleSearchModal from './home/meetpeople/MeetPeopleSearchModal';

const searchPic = '/bottom_navigation.icon/search.icon.webp';
const footPic = '/bottom_navigation.icon/footprint.icon.webp';
const notificationPic = '/header/notification.webp';
const pointPic = '/bottom_navigation.icon/point.icon.webp';
const NextPic = '/header/next.webp';

import { usePathname, useRouter } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
// TODO: i18n - import { useTranslations } from '#/i18n';
import { useEffect, useState } from 'react';
import type { LstNotiResponseData } from '@/apis/lst-noti';
import { HTTP_GET_NOTIFICATIONS } from '@/constants/endpoints';
import { usePurchaseAttribution } from '@/hooks/usePurchaseAttribution';
import { PURCHASE_FLOW } from '@/types/purchaseAttribution';
import { getFromNext } from '@/utils/next';
import { getCurrentDateInJapan } from '@/utils/timeUti';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoginUser } = useGetMyInfo();
  const currentPath = pathname;
  const { status } = useSession();
  const callState = useCallStore((s) => s.callState);
  const t = useTranslations('header');
  const [searchModal, setSearchModal] = useState(false);
  const [showFootprintBadge, setShowFootprintBadge] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [appId, setAppId] = useState<'15' | '57'>('15');
  const isActive = (path: string) => currentPath === path;
  const { trackPurchaseIntent } = usePurchaseAttribution();

  // ポイント購入ボタンのクリックハンドラー
  const handlePointPurchaseClick = () => {
    trackPurchaseIntent(
      'header.point_purchase_button',
      PURCHASE_FLOW.PURCHASE_PAGE,
    );
  };

  // 未読件数の取得
  const fetchUnread = async () => {
    if (typeof window === 'undefined') return;
    try {
      const response = await getFromNext<{
        type: 'success' | 'error';
        notifications: LstNotiResponseData[];
      }>(HTTP_GET_NOTIFICATIONS);
      if (response.type === 'success') {
        const notifications = response.notifications;
        const lastReadTime = localStorage.getItem('lastNotificationTimeUTC');

        // lastReadTimeが存在しない場合は全て既読として扱う
        if (!lastReadTime) {
          setUnreadCount(0);
          return;
        }

        const unread = notifications.filter(
          (n) => n.time && n.time > lastReadTime && n.notiType !== 17,
        );
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    const currentDate = getCurrentDateInJapan();
    setShowFootprintBadge(
      localStorage.getItem('lastFootprintPageOpenedDate') !== currentDate,
    );

    // 初回読み込み時に未読件数を取得
    fetchUnread();
  }, []);

  // Cookie の isUtano が 'false' かどうかで分岐
  useEffect(() => {
    const match = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('isUtano='));

    if (!match) {
      // Cookieがそもそも存在しない → utano_verが無い → 15
      setAppId('15');
      return;
    }

    // ex) isUtano=1.7
    const value = match.split('=')[1];
    // 'false' ではない ⇒ 何かしら utano_ver があった ⇒ 57
    if (value !== 'false') {
      setAppId('57');
    } else {
      setAppId('15');
    }
  }, []);

  const _isUtage = appId === '15';

  if (callState === inCall) return <div></div>;
  const onClickRegisterButton = () => {
    if (status === 'loading') return;
    router.push('/signup');
  };
  // ページ遷移時のバッジ更新処理
  const _updateBadgeStatus = (path: string) => {
    const currentDate = getCurrentDateInJapan();

    switch (path) {
      case '/timeline/list':
        localStorage.setItem('lastTimelinePageOpenedDate', currentDate);
        break;
      case '/gallery/movie':
        localStorage.setItem('lastMoviePageOpenedDate', currentDate);
        break;
      case '/gallery/image':
        localStorage.setItem('lastImagePageOpenedDate', currentDate);
        break;
    }
  };

  // 通知ページクリック時の処理
  const handleNotificationClick = () => {
    const now = new Date();
    const utcYear = now.getUTCFullYear().toString();
    const utcMonth = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    const utcDay = now.getUTCDate().toString().padStart(2, '0');
    const utcHours = now.getUTCHours().toString().padStart(2, '0');
    const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
    const utcSeconds = now.getUTCSeconds().toString().padStart(2, '0');
    const formattedDate = `${utcYear}${utcMonth}${utcDay}${utcHours}${utcMinutes}${utcSeconds}`;
    localStorage.setItem('lastNotificationTimeUTC', formattedDate);
    setUnreadCount(0);
  };

  return (
    <header className={styles.header}>
      <Link href="/">
        <div className={styles.logo}>
          <Image
            src={logoPic}
            alt="Utage"
            width="90"
            height="35"
            priority={true}
            loading="eager"
          />
        </div>
      </Link>
      {isLoginUser === false && (
        <div onClick={onClickRegisterButton} className={styles.button}>
          <span className={styles.text}>{t('freeRegistration')}</span>
          <Image
            src={NextPic}
            alt={t('iconAlt')}
            width="14"
            height="14"
            className={styles.next}
          />
        </div>
      )}
      {isLoginUser && (
        <>
          <div className={`${styles.item}`}>
            {!isLoginUser ? (
              <a
                onClick={() => router.push('/signup')}
                style={{ cursor: 'pointer' }}
              >
                <Image
                  src={footPic}
                  alt={t('footprintIconAlt')}
                  width={25}
                  height={25}
                  priority
                  loading="eager"
                />
                {showFootprintBadge && <span className={styles.badge}>●</span>}
                <br />
                <span>{t('footprint')}</span>
              </a>
            ) : (
              <Link
                href="/footprint-list"
                className={isActive('/footprint-list') ? styles.active : ''}
              >
                <Image
                  src={footPic}
                  alt={t('footprintIconAlt')}
                  width={25}
                  height={25}
                  priority
                  loading="eager"
                />
                {showFootprintBadge && <span className={styles.badge}>●</span>}
                <br />
                <span>{t('footprint')}</span>
              </Link>
            )}
          </div>

          <div className={`${styles.item}`}>
            {!isLoginUser ? (
              <a
                onClick={() => router.push('/signup')}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ position: 'relative' }}>
                  <Image
                    src={notificationPic}
                    alt={t('notificationIconAlt')}
                    width={25}
                    height={25}
                    priority
                    loading="eager"
                  />
                  {unreadCount > 0 && <span className={styles.badge}>●</span>}
                </div>
                <span>{t('notifications')}</span>
              </a>
            ) : (
              <Link
                href="/notification"
                className={isActive('/notification') ? styles.active : ''}
                onClick={handleNotificationClick}
              >
                <div style={{ position: 'relative' }}>
                  <Image
                    src={notificationPic}
                    alt={t('notificationIconAlt')}
                    width={25}
                    height={25}
                    priority
                    loading="eager"
                  />
                  {unreadCount > 0 && <span className={styles.badge}>●</span>}
                </div>
                <span>{t('notifications')}</span>
              </Link>
            )}
          </div>

          <div className={`${styles.item}`}>
            {!isLoginUser ? (
              <a
                onClick={() => router.push('/signup')}
                style={{ cursor: 'pointer' }}
              >
                <Image
                  src={pointPic}
                  alt={t('pointIconAlt')}
                  width={25}
                  height={25}
                  priority
                  loading="eager"
                />
                <br />
                <span>{t('points')}</span>
              </a>
            ) : (
              <Link
                href="/purchase?source=header"
                className={isActive('/purchase') ? styles.active : ''}
                onClick={handlePointPurchaseClick}
              >
                <Image
                  src={pointPic}
                  alt={t('pointIconAlt')}
                  width={25}
                  height={25}
                  priority
                  loading="eager"
                />
                <br />
                <span>{t('points')}</span>
              </Link>
            )}
          </div>

          <div className={`${styles.item}`}>
            <a
              onClick={() => {
                if (!isLoginUser) {
                  router.push('/signup');
                  return;
                }
                setSearchModal(true);
              }}
            >
              {!pathname?.includes('search') && (
                <Image
                  src={searchPic}
                  alt="search"
                  width={25}
                  height={25}
                  className={isActive('/') ? styles.activeIcon : styles.icon}
                />
              )}
              {searchModal && (
                <MeetPeopleSearchModal
                  onClose={() => {
                    setSearchModal(false);
                  }}
                />
              )}
              <br />
              <span>{t('search')}</span>
            </a>
          </div>
        </>
      )}
    </header>
  );
};
export default Header;
