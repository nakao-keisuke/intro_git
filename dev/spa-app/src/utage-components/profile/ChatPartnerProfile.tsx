import { IconCrown, IconHeart, IconStar } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useBookmark } from '@/hooks/useBookmark';
import { useFavorite } from '@/hooks/useFavorite';
import styles from '@/styles/profile/ChatPartnerProfile.module.css';
import type { MediaInfo } from '@/types/MediaInfo';
import type { PartnerInfo } from '@/types/PartnerInfo';
import type { TimelineItem } from '@/types/TimelineItem';
import { imageUrl } from '@/utils/image';
import profilePic from '../../../public/profile/prf.webp';
import beginnerPic from '../../../public/situation.icon/beginner.webp';

type Props = {
  partnerInfo: PartnerInfo;
  isLoggedIn: boolean;
  thumbnailList: MediaInfo[];
  isCallWaiting: boolean;
  isCalling: boolean;
  isFavorited: boolean;
  rank?: number | undefined;
  canSendOneTapMessage: boolean;
  isBookmarked: boolean;
  isPurchased: boolean;
  isBonusCourseExist: boolean;
  timeLineList: TimelineItem[];
};

function formatLoginTime(rawLoginTime: string) {
  const year = rawLoginTime.substr(0, 4);
  const month = rawLoginTime.substr(4, 2);
  const day = rawLoginTime.substr(6, 2);
  const hour = rawLoginTime.substr(8, 2);
  const minute = rawLoginTime.substr(10, 2);
  const second = rawLoginTime.substr(12, 2);

  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    ),
  );
}

const ChatPartnerProfile = ({
  partnerInfo,
  isLoggedIn,
  thumbnailList = [],
  isCallWaiting,
  isCalling,
  isFavorited,
  rank,
  canSendOneTapMessage,
  isBookmarked,
  isPurchased,
  isBonusCourseExist,
  timeLineList = [],
}: Props) => {
  const _router = useRouter();
  const [isLiked, setIsLiked] = useState(isFavorited);
  const [_showlikeMessage, setSholikeMessage] = useState(false);
  const [isFavoriting, setFavoriting] = useState(false);
  const [_giftModalOpen, _setGiftModalOpen] = useState(false);
  const [_currentImageIndex, _setCurrentImageIndex] = useState(0);
  const { addFavorite } = useFavorite();
  const {
    isBookmarked: isBookmarkedState,
    bookmarkCooldown,
    addBookmark,
    removeBookmark,
  } = useBookmark(partnerInfo.userId, isBookmarked);

  const lastLogin = formatLoginTime(partnerInfo.lastLoginTime);
  const now = new Date();
  const lastLoginHoursAgo =
    (now.getTime() - lastLogin.getTime()) / 1000 / 60 / 60;

  let _loginStatus: string;
  let statusColor: string;

  if (isCallWaiting) {
    _loginStatus = '着信待ち';
    statusColor = '#F6993D';
  } else if (isCalling) {
    _loginStatus = '２ショット中';
    statusColor = '#f6899f';
  } else if (lastLoginHoursAgo <= 6) {
    _loginStatus = 'オンライン';
    statusColor = 'rgb(67, 220, 43)';
  } else if (lastLoginHoursAgo <= 24) {
    _loginStatus = '24時間以内';
    statusColor = 'rgb(255, 175, 47)';
  } else {
    _loginStatus = '24時間以上';
    statusColor = 'rgb(142, 142, 142)';
  }

  const favoSend = async () => {
    if (isLiked || isFavoriting) {
      return;
    }
    setIsLiked(true);
    setFavoriting(true);
    setSholikeMessage(true);

    const { success } = await addFavorite(partnerInfo.userId);
    if (!success) {
      setIsLiked(false);
    }

    setTimeout(() => {
      setFavoriting(false);
    }, 4000);
  };

  const displayRank = () => {
    if (rank && rank <= 12) {
      return `${rank}`;
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileImage}>
        {thumbnailList.length > 0 && thumbnailList[0]?.thumbnailId ? (
          <Image
            src={imageUrl(thumbnailList[0].thumbnailId)}
            alt={`${partnerInfo.userName}のプロフィール画像`}
            width={300}
            height={300}
            className={styles.mainImage}
          />
        ) : (
          <div className={styles.noImage}>画像はありません</div>
        )}
      </div>

      <div className={styles.header}>
        <div className={styles.userName}>
          <div className={styles.online} style={{ color: statusColor }}>
            ●
          </div>
          {partnerInfo.userName}　{partnerInfo.age}歳
          {partnerInfo.isNewUser && (
            <div className={styles.beginner}>
              <Image src={beginnerPic} alt="beginner" width={20} height={20} />
            </div>
          )}
        </div>
        {rank && rank <= 12 && (
          <div className={styles.rank}>
            <IconCrown size={16} className={styles.crownIcon || ''} />
            ランキング{displayRank()}位
          </div>
        )}
      </div>

      <div className={styles.profileSection}>
        <div className={styles.sectionTitle}>
          <Image
            src={profilePic}
            alt="profile"
            width={20}
            height={20}
            style={{ marginRight: '8px' }}
          />
          プロフィール
        </div>
        <div className={styles.profileGrid}>
          <div className={styles.profileItem}>
            <span className={styles.label}>地域</span>
            <span>{partnerInfo.region}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>スタイル</span>
            <span>{partnerInfo.bodyType}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>Hレベル</span>
            <span>{partnerInfo.hLevel}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>バスト</span>
            <span>{partnerInfo.bustSize}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>趣味</span>
            <span>{partnerInfo.hobby?.join('、') || '未設定'}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>性格</span>
            <span>{partnerInfo.personality?.join('、') || '未設定'}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>職業</span>
            <span>{partnerInfo.job || '未設定'}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>結婚歴</span>
            <span>{partnerInfo.marriageHistory || '未設定'}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>顔出し</span>
            <span>{partnerInfo.showingFace || '未設定'}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>通話ステップ</span>
            <span>{partnerInfo.stepToCall || '未設定'}</span>
          </div>
          <div className={styles.profileItem}>
            <span className={styles.label}>話題</span>
            <span>{partnerInfo.talkTheme || '未設定'}</span>
          </div>
        </div>
      </div>

      <div className={styles.aboutSection}>
        <div className={styles.sectionTitle}>自己紹介</div>
        <div className={styles.aboutText}>
          {partnerInfo.about || '自己紹介はありません'}
        </div>
      </div>

      {isLoggedIn && (
        <div className={styles.actionButtons}>
          <button
            className={isLiked ? styles.likedButton : styles.likeButton}
            onClick={favoSend}
            disabled={isLiked}
          >
            <IconHeart size={20} style={{ marginRight: '5px' }} />
            {isLiked ? 'いいね済み' : 'いいね！'}
          </button>

          <button
            className={
              isBookmarkedState
                ? styles.bookmarkedButton
                : styles.bookmarkButton
            }
            onClick={isBookmarkedState ? removeBookmark : addBookmark}
            disabled={bookmarkCooldown}
          >
            <IconStar size={20} style={{ marginRight: '5px' }} />
            {isBookmarkedState ? 'お気に入り済み' : 'お気に入り'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPartnerProfile;
