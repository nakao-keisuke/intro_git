// Image component removed (use <img> directly);
import styles from '@/styles/home/VerticalBar.module.css';

const starPic = '/bottom_navigation.icon/bottom_star.webp';
const footPic = '/bottom_navigation.icon/bottom_foot.webp';
const myPic = '/bottom_navigation.icon/botoom_my.webp';

import { useSession } from '#/hooks/useSession';
import { useState } from 'react';
import { useUnreadCount } from '@/hooks/usePollingData';

const hovermyPic = '/bottom_navigation.icon/hover_my.webp';
const hoverstarPic = '/bottom_navigation.icon/hover_star.webp';
const hoverfootPic = '/bottom_navigation.icon/hover_foot.webp';
const pointPic = '/g_point.webp';
const _cardPic = '/purchase/card_icon.webp';

import { toast } from 'react-toastify';
import { useCallStore } from '@/stores/callStore';
import { usePointStore } from '@/stores/pointStore';
import { beforeCall } from '@/utils/callState';
import AlvionPaymentModal from '../purchase/AlvionPaymentModal';

const PCVerticalBar = () => {
  const unreadCountData = useUnreadCount();
  const _unreadCount = unreadCountData?.data;
  const { data: session } = useSession();
  const callState = useCallStore((s) => s.callState);
  const [isHoveredMyPage, setIsHoveredMyPage] = useState(false);
  const [_isHoveredCharge, _setIsHoveredCharge] = useState(false);
  const [isHoveredStar, setIsHoveredStar] = useState(false);
  const [isHoveredFoot, setIsHoveredFoot] = useState(false);
  const updatePointOptimistic = usePointStore((s) => s.updatePointOptimistic);
  const [isAlvionPaymentModalOpen, setAlvionModalOpen] = useState(false);
  const handleOpenAlvionModal = () => {
    setAlvionModalOpen(true);
  };

  const handlePurchaseSuccess = (addedPoints: number) => {
    setAlvionModalOpen(false);
    updatePointOptimistic(addedPoints);
    toast(`${addedPoints}ポイントを購入しました！`);
  };

  if (callState !== beforeCall) return null;

  return (
    <>
      <div className={styles.verticalBar}>
        <div className={styles.mypagee}>
          <a href="/my-page/pc" className={styles.item}>
            <span
              className={styles.mypageee}
              onMouseEnter={() => setIsHoveredMyPage(true)}
              onMouseLeave={() => setIsHoveredMyPage(false)}
            >
              <Image
                src={isHoveredMyPage ? hovermyPic : myPic}
                alt="マイページアイコン"
                width="23"
                height="23"
                priority={true}
                loading="eager"
                style={{ marginRight: '5px' }}
              />
              マイページ
            </span>
          </a>
          <a href="/bookmark-list/pc" className={styles.item}>
            <span
              className={styles.mypageee}
              onMouseEnter={() => setIsHoveredStar(true)}
              onMouseLeave={() => setIsHoveredStar(false)}
            >
              <Image
                src={isHoveredStar ? hoverstarPic : starPic}
                alt="お気に入りアイコン"
                width="23"
                height="23"
                priority={true}
                loading="eager"
                style={{ marginRight: '5px' }}
              />
              お気に入り
            </span>
          </a>
          <a href="/footprint-list/pc" className={styles.item}>
            <span
              className={styles.mypage}
              onMouseEnter={() => setIsHoveredFoot(true)}
              onMouseLeave={() => setIsHoveredFoot(false)}
            >
              <Image
                src={isHoveredFoot ? hoverfootPic : footPic}
                alt="足あとアイコン"
                width="23"
                height="23"
                priority={true}
                loading="eager"
                style={{ marginRight: '5px' }}
              />
              足あと
            </span>
          </a>
        </div>
        <div className={styles.charge} onClick={handleOpenAlvionModal}>
          <div className={styles.item}>
            <span className={styles.center}>
              <Image
                src={pointPic}
                alt="アイコン"
                width="20"
                height="20"
                style={{ marginRight: '5px' }}
              />
              ポイントをチャージする
            </span>
          </div>
        </div>
        <div className={styles.syouhi}>
          ポイント説明<span className={styles.sp}>★業界最安値！</span>
        </div>
        <div className={styles.pt}>
          <li className={styles.li}>
            メッセージ
            <span className={styles.b}>
              60<span className={styles.bc}>pt/通</span>
            </span>
          </li>
          <li className={styles.li}>
            音声通話
            <span className={styles.b}>
              140<span className={styles.bc}>pt/分</span>
            </span>
          </li>
          <li className={styles.li}>
            ２ショット
            <span className={styles.b}>
              200<span className={styles.bc}>pt/分</span>
            </span>
          </li>
          <li className={styles.li}>
            ビデオチャット
            <span className={styles.b}>
              200<span className={styles.bc}>pt/分</span>
            </span>
          </li>
          <li className={styles.li}>
            ビデオチャット視聴
            <span className={styles.b}>
              200<span className={styles.bc}>pt/分</span>
            </span>
          </li>
          <li className={styles.li}>
            画像開封
            <span className={styles.b}>
              75<span className={styles.bc}>pt/通</span>
            </span>
          </li>
          <li className={styles.lii}>
            動画開封
            <span className={styles.b}>
              120<span className={styles.bc}>pt/通</span>
            </span>
          </li>
        </div>
        <div className={styles.miru}>
          <a href="/setting/point-howto/pc" className={styles.item}>
            ポイントの詳細を見る　&gt;
          </a>
        </div>
      </div>
      {isAlvionPaymentModalOpen && (
        <AlvionPaymentModal
          token={session?.user.token || ''}
          onClose={() => setAlvionModalOpen(false)}
          onSuccess={handlePurchaseSuccess}
          isPC={true}
        />
      )}
    </>
  );
};

export default PCVerticalBar;
