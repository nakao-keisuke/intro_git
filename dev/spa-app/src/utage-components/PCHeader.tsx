// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import styles from '@/styles/PCHeader.module.css';

const logoPic = '/header/utage_logo.webp';
const humanPic = '/bottom_navigation.icon/bottom_my_b.webp';

import { useGetMyInfo } from '@/hooks/useGetMyInfo.hook';
import { beforeCall } from '@/utils/callState';
import Thumbnail from './mypage/Thumbnail';

const pointPic = '/y_point.webp';
const NextPic = '/header/next.webp';

import { useSession } from '#/hooks/useSession';
// TODO: i18n - import { useTranslations } from '#/i18n';
import { useCallStore } from '@/stores/callStore';
import { useUIStore } from '@/stores/uiStore';

const notificationPic = '/notification.svg';

import { usePathname, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useScrollDirection } from '@/hooks/useScrollDirection.hook';
import { getCurrentDateInJapan } from '@/utils/timeUti';

export const PCHeader: React.FC = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const { status } = useSession(); // セッションの状態を取得
  const openRegisterModal = useUIStore((s) => s.openRegisterModal);
  const { isLoginUser, myUserInfo } = useGetMyInfo();
  const callState = useCallStore((s) => s.callState);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const scrollDirection = useScrollDirection();
  const t = useTranslations('header');
  // ページ遷移時のバッジ更新処理
  const updateBadgeStatus = (path: string) => {
    const currentDate = getCurrentDateInJapan();

    switch (path) {
      case '/notification/pc':
        localStorage.setItem('lastNotificationPageOpenedDate', currentDate);
        setShowNotificationBadge(false);
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
    setShowNotificationBadge(
      localStorage.getItem('lastNotificationPageOpenedDate') !== currentDate,
    );
  }, []);

  if (callState !== beforeCall) return null;

  const onClickRegisterButton = () => {
    if (status === 'loading') return; // ローディング中はモーダルを開かない
    openRegisterModal();
  };

  return (
    <header
      className={`${styles.pcHeaderFixed} ${scrollDirection === 'down' ? styles.hidden : ''}`}
    >
      <div className={styles.header}>
        <Link href="/pc">
          <div className={styles.logo}>
            <Image
              src={logoPic}
              alt="Utage"
              width="110"
              height="45"
              priority={true}
              loading="eager"
            />
          </div>
        </Link>
        {isLoginUser === false && (
          <button onClick={onClickRegisterButton} className={styles.button}>
            <span className={styles.text}>{t('freeRegistration')}</span>
            <Image
              src={NextPic}
              alt={t('iconAlt')}
              width="16"
              height="16"
              className={styles.next}
            />
          </button>
        )}
        {isLoginUser && (
          <div className={styles.myInfoText}>
            <div className={styles.NAME}>
              <span className={styles.name}>
                {t('userGreeting', { name: myUserInfo.userName })}
              </span>
            </div>
            <Link href="/purchase">
              <div className={styles.point}>
                <span className={styles.pt}>
                  <Image
                    src={pointPic}
                    alt={t('pointIconAlt')}
                    width="19"
                    height="19"
                  />
                  {myUserInfo.point}
                </span>
                pt
              </div>
            </Link>
            {/* お知らせ画面遷移ボタン */}
            <div
              className={styles.notification_button}
              onClick={() => router.push('/notification/pc')}
            >
              {showNotificationBadge && <span className={styles.badge}>●</span>}
              <Image
                src={notificationPic}
                alt={t('notificationIconAlt')}
                width="40"
                height="40"
              />
            </div>
          </div>
        )}

        <div className={styles.avatar}>
          <Link href="/my-page">
            {isLoginUser && (
              <div className={styles.icon}>
                <Thumbnail id={myUserInfo.avatarId} priority={true} size={35} />
              </div>
            )}
            {isLoginUser === false && (
              <Image
                src={humanPic}
                alt="Avatar"
                width="27"
                height="27"
                priority={true}
                loading="eager"
              />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
