import { IconCrown, IconHeart } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useBookmark } from '@/hooks/useBookmark';
import { useFavorite } from '@/hooks/useFavorite';
import type { MediaInfo } from '@/types/MediaInfo';
import type { PartnerInfo } from '@/types/PartnerInfo';
import type { TimelineItem } from '@/types/TimelineItem';
import { imageUrl } from '@/utils/image';
import livePic from '../../../public/profile/live.webp';
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
  isLive?: boolean;
  liveTitle: string | undefined;
  viewerCount: number | undefined;
  channelType: string | undefined;
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

const ChatLiveChannelerProfile = ({
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
  isLive = false,
  liveTitle = '',
  viewerCount = 0,
  channelType = '',
}: Props) => {
  const _router = useRouter();
  const [isLiked, setIsLiked] = useState(isFavorited);
  const [_showlikeMessage, setSholikeMessage] = useState(false);
  const [isFavoriting, setFavoriting] = useState(false);
  const [_giftModalOpen, setGiftModalOpen] = useState(false);
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

  if (isLive) {
    _loginStatus = 'ライブ配信中';
    statusColor = '#ff4081';
  } else if (isCallWaiting) {
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

  const _openGiftModal = () => {
    setGiftModalOpen(true);
  };

  return (
    <div
      className="flex h-full flex-col gap-4 overflow-y-auto rounded-lg p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
      style={{
        background: 'linear-gradient(to bottom, #f9f9f9, #ffffff)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="relative mb-1.5 h-auto w-full overflow-hidden rounded-[10px]">
        {thumbnailList.length > 0 && thumbnailList[0]?.thumbnailId ? (
          <Image
            src={imageUrl(thumbnailList[0].thumbnailId)}
            alt={`${partnerInfo.userName}のプロフィール画像`}
            width={300}
            height={300}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f0f0f0] text-[#666] text-sm">
            画像はありません
          </div>
        )}
      </div>

      <div className="relative mb-1.5 flex flex-col">
        <div className="flex items-center font-bold text-lg">
          <div
            className="mr-1.5 flex items-center justify-center"
            style={{
              color: statusColor,
              animation: 'blink 1.5s infinite',
            }}
          >
            ●
          </div>
          {partnerInfo.userName}　{partnerInfo.age}歳
          {partnerInfo.isNewUser && (
            <div className="ml-1.5 inline-flex">
              <Image src={beginnerPic} alt="beginner" width={20} height={20} />
            </div>
          )}
        </div>
        {rank && rank <= 12 && (
          <div className="flex items-center text-[#ffd700] text-sm">
            <IconCrown size={20} className="mr-1.5" />
            ランキング{displayRank()}位
          </div>
        )}
      </div>

      {isLive && (
        <div className="mb-2.5 rounded-lg bg-white p-[15px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="relative mb-[15px] flex items-center border-[#f0f0f0] border-b pb-2 font-bold text-[#333] text-base after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-[50px] after:rounded-[3px] after:bg-gradient-to-r after:from-[#48c1eb] after:to-[#f69ba0] after:content-['']">
            <Image
              src={livePic}
              alt="live"
              width={20}
              height={20}
              style={{ marginRight: '8px' }}
            />
            ライブ配信情報
          </div>
          <div>
            <div className="mb-1 font-medium">
              {liveTitle || 'ライブ配信中'}
            </div>
            <div className="flex gap-2 text-sm">
              <span>{viewerCount}人視聴中</span>
              {channelType && <span>{channelType}</span>}
            </div>
          </div>
        </div>
      )}

      <div className="mb-2.5 rounded-lg bg-white p-[15px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="relative mb-[15px] flex items-center border-[#f0f0f0] border-b pb-2 font-bold text-[#333] text-base after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-[50px] after:rounded-[3px] after:bg-gradient-to-r after:from-[#48c1eb] after:to-[#f69ba0] after:content-['']">
          <Image
            src={profilePic}
            alt="profile"
            width={20}
            height={20}
            style={{ marginRight: '8px' }}
          />
          プロフィール
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col text-sm">
            <span className="mb-[3px] text-[#898989] text-xs">地域</span>
            <span>{partnerInfo.region}</span>
          </div>
          <div className="flex flex-col text-sm">
            <span className="mb-[3px] text-[#898989] text-xs">スタイル</span>
            <span>{partnerInfo.bodyType}</span>
          </div>
          <div className="flex flex-col text-sm">
            <span className="mb-[3px] text-[#898989] text-xs">趣味</span>
            <span>{partnerInfo.hobby?.join('、') || '未設定'}</span>
          </div>
          <div className="flex flex-col text-sm">
            <span className="mb-[3px] text-[#898989] text-xs">性格</span>
            <span>{partnerInfo.personality?.join('、') || '未設定'}</span>
          </div>
          <div className="flex flex-col text-sm">
            <span className="mb-[3px] text-[#898989] text-xs">職業</span>
            <span>{partnerInfo.job || '未設定'}</span>
          </div>
          <div className="flex flex-col text-sm">
            <span className="mb-[3px] text-[#898989] text-xs">結婚歴</span>
            <span>{partnerInfo.marriageHistory || '未設定'}</span>
          </div>
        </div>
      </div>

      <div className="mb-2.5 rounded-lg bg-white p-[15px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <div className="relative mb-[15px] flex items-center border-[#f0f0f0] border-b pb-2 font-bold text-[#333] text-base after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-[50px] after:rounded-[3px] after:bg-gradient-to-r after:from-[#48c1eb] after:to-[#f69ba0] after:content-['']">
          自己紹介
        </div>
        <div className="whitespace-pre-wrap text-sm leading-[1.5]">
          {partnerInfo.about || '自己紹介はありません'}
        </div>
      </div>

      <div
        className="mt-auto flex items-center justify-center gap-[15px] border-[#f0f0f0] border-t py-5"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.9))',
        }}
      >
        <button
          className={`rounded-[20px] border-none px-5 py-2.5 font-bold text-sm transition-all duration-300 ${
            isLiked
              ? 'cursor-default bg-[#e0e0e0] text-[#666]'
              : 'cursor-pointer bg-[#f89db2] text-white hover:opacity-80'
          }`}
          onClick={favoSend}
          disabled={isLiked}
        >
          <IconHeart size={20} style={{ marginRight: '5px' }} />
          {isLiked ? 'いいね済み' : 'いいね！'}
        </button>

        <button
          className={`rounded-[20px] border-none px-5 py-2.5 font-bold text-sm transition-all duration-300 ${
            isBookmarkedState
              ? 'cursor-default bg-[#e0e0e0] text-[#666]'
              : 'cursor-pointer bg-[#f89db2] text-white hover:opacity-80'
          }`}
          onClick={isBookmarkedState ? removeBookmark : addBookmark}
          disabled={bookmarkCooldown}
        >
          <IconHeart size={20} style={{ marginRight: '5px' }} />
          {isBookmarkedState ? 'お気に入り済み' : 'お気に入り'}
        </button>
      </div>

      {/* <button
        className={styles.joinLiveButton}
        onClick={() => router.push(`/live/${partnerInfo.userId}`)}
      >
        ライブに参加する
      </button> */}
    </div>
  );
};

export default ChatLiveChannelerProfile;
