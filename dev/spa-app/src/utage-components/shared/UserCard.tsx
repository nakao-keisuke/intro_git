import { Phone, ThumbsUp, Video } from 'lucide-react';
// Image component removed (use <img> directly);
import { Link } from '@tanstack/react-router';
import { useLocation } from '@tanstack/react-router';
import React, { useState } from 'react';
import { VideoCallConfirmModal } from '@/app/[locale]/(tab-layout)/girls/all/components/VideoCallConfirmModal';
import { VoiceCallConfirmModal } from '@/app/[locale]/(tab-layout)/girls/all/components/VoiceCallConfirmModal';
import FallbackImage from '@/components/common/FallbackImage';
import StarRating from '@/components/StarRating/StarRating';
import FleaMarketListedBadge from '@/components/shared/FleaMarketListedBadge';
import { event } from '@/constants/ga4Event';
import { useFavorite } from '@/hooks/useFavorite';
import { useProfileAttribution } from '@/hooks/useProfileAttribution';
import type { SectionName } from '@/types/profileAttributionType';
import { trackEvent } from '@/utils/eventTracker';
import { imageUrl } from '@/utils/image';
import { getOnlineStatusColor } from '@/utils/personality';
import { getRegionName } from '@/utils/regionMapping';

export interface UserCardData {
  userId: string;
  userName: string;
  age: number;
  abt?: string;
  region: number;
  avaId: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  lastLoginTime: string;
  isNewUser: boolean;
  isCalling: boolean;
  hasLovense?: boolean;
  isListedOnFleaMarket?: boolean;
  isFav?: number; // いいね済みフラグ (1: いいね済み, 0: 未いいね)
  bustSize?: string;
  averageScore?: number; // 平均評価スコア
  reviewCount?: number; // レビュー件数
}

interface UserCardProps {
  user: UserCardData;
  priority?: boolean;
  hideAbt?: boolean;
  hideUserName?: boolean;
  metaOrder?: 'region-age' | 'age-region';
  metaTextClassName?: string | undefined;
  sectionName?: SectionName | undefined;
}

type ModalType = 'voice-call' | 'video-call';

type ModalUserInfo = {
  userId: string;
  userName: string;
  age: number;
  region: number;
  avaId: string;
  hasLovense?: boolean | undefined;
  bustSize?: string | undefined;
};

const UserCardComponent: React.FC<UserCardProps> = ({
  user,
  priority = false,
  hideAbt = false,
  hideUserName = false,
  metaOrder = 'region-age',
  metaTextClassName,
  sectionName,
}) => {
  const pathname = usePathname();
  const { trackProfileIntent } = useProfileAttribution();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [modalUserInfo, setModalUserInfo] = useState<ModalUserInfo | null>(
    null,
  );

  // ローカルストレージからいいね状態を取得（リロード後も維持）
  const getInitialLikedState = () => {
    if (typeof window === 'undefined') {
      return !!user.isFav && user.isFav !== 0;
    }

    const storageKey = `liked_${user.userId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored !== null) {
      return stored === '1';
    }

    // isFavが1、true、"1"などの場合にtrueとする（より柔軟な判定）
    return !!user.isFav && user.isFav !== 0;
  };

  const [isLiked, setIsLiked] = useState(getInitialLikedState);
  const [isLiking, setIsLiking] = useState(false);
  const { addFavorite } = useFavorite();

  const href = `/profile/unbroadcaster/${user.userId}`;
  const onlineStatusColor = getOnlineStatusColor(user.lastLoginTime);
  const isOnline = onlineStatusColor === 'bg-green-500';

  const handleTwoshotModalOpen = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const callType: ModalType = user.videoCallWaiting
      ? 'video-call'
      : 'voice-call';

    setModalUserInfo({
      userId: user.userId,
      userName: user.userName,
      age: user.age,
      region: user.region,
      avaId: user.avaId,
      hasLovense: user.hasLovense,
      bustSize: user.bustSize,
    });
    setModalType(callType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (isLiking || isLiked) {
      return;
    }

    setIsLiking(true);

    const { success, errorMessage } = await addFavorite(user.userId);

    if (success) {
      setIsLiked(true);
      // ローカルストレージに保存（リロード後も維持）
      localStorage.setItem(`liked_${user.userId}`, '1');

      // GA4イベント送信（ページパス情報を含める）
      trackEvent(event.SEND_GOOD, {
        partner_id: user.userId,
        page_path: pathname,
      });
    } else {
      alert(errorMessage || 'いいねの送信に失敗しました');
    }

    setIsLiking(false);
  };

  return (
    <div className="relative w-full">
      {/* 配信中ユーザーのプロフィールページへの遷移に統一 */}
      <Link
        href={href}
        className="relative block"
        onClick={() => {
          // girls/all からのプロフィール遷移のみ起点保存
          if (pathname?.startsWith('/girls/all')) {
            trackProfileIntent(sectionName);
          }
        }}
        // rel="external"
      >
        {/* 着信待ちラベル */}
        {/* 通話をしていないかつ音声・ビデオ通話許可がオンのユーザーに表示 */}
        {/* {!user.isCalling &&
          (user.voiceCallWaiting || user.videoCallWaiting) && (
            <div className="absolute left-0 top-[-10px] z-20 rounded-full bg-orange-400 py-1 px-2 text-center text-xs text-white font-bold">
              着信待ち
            </div>
          )}

        {user.isCalling && user.voiceCallWaiting && (
          <div className="absolute left-0 top-[-10px] z-20 rounded-full bg-blue-400 py-1 px-2 text-center text-xs text-white font-bold">
            音声通話中
          </div>
        )}

        {user.isCalling && user.videoCallWaiting && (
          <div className="absolute left-0 top-[-10px] z-20 rounded-full bg-pink-400 py-1 px-2 text-center text-xs text-white font-bold">
            ビデオ通話中
          </div>
        )} */}

        {/* サムネイル画像 */}
        <div className="relative mt-2 aspect-square w-full">
          <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-200">
            <FallbackImage
              src={imageUrl(user.avaId)}
              alt="ユーザー画像"
              width={120}
              height={120}
              className="h-full w-full object-cover"
              priority={priority}
              quality={95}
            />
          </div>

          {/* 左下: Lovenseマーク、新人マーク、バストサイズ、星評価 */}
          {(user.isNewUser ||
            user.hasLovense ||
            user.bustSize ||
            (user.reviewCount !== undefined && user.reviewCount > 0)) && (
            <div className="absolute bottom-1 left-1 z-20 flex flex-col items-start gap-0.5">
              {/* 新人とLovenseは横並び */}
              {(user.hasLovense || user.isNewUser) && (
                <div className="flex flex-row gap-0.5">
                  {user.hasLovense && (
                    <div className="h-6 w-6">
                      <Image
                        src="/lovense_pink.webp"
                        alt="Lovenseアイコン"
                        className="rounded-full bg-white p-0.5"
                        width={24}
                        height={24}
                      />
                    </div>
                  )}
                  {user.isNewUser && (
                    <Image
                      src="/beginner.icon.webp"
                      alt="新人マーク"
                      width={28}
                      height={28}
                      className="animate-pulse"
                    />
                  )}
                </div>
              )}
              {/* バストサイズは縦並び */}
              {user.bustSize && (
                <div className="flex items-center gap-0.5 rounded-full bg-pink-100 px-1 py-0.5 font-semibold text-[10px] text-pink-500">
                  <span>👙{user.bustSize}</span>
                </div>
              )}
              {/* 星評価（レビュー件数が1件以上の場合のみ表示） */}
              {user.reviewCount !== undefined && user.reviewCount > 0 && (
                <div className="flex items-center gap-0.5 rounded-full bg-white/90 px-1 py-0.5">
                  <StarRating score={user.averageScore ?? 0} size={12} />
                  <span className="font-semibold text-[10px] text-gray-600">
                    ({user.reviewCount})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* フリマ出品アイコン */}
          {user.isListedOnFleaMarket && <FleaMarketListedBadge />}

          {/* 通話発信ボタン */}
          {user.videoCallWaiting && (
            <div className="absolute right-1 bottom-0.5 flex gap-1">
              <button
                onClick={handleTwoshotModalOpen}
                className="group relative flex h-12 w-12 flex-col items-center justify-center gap-0 rounded-full bg-gradient-to-br from-red-300 to-red-400 shadow-[6px_6px_12px_rgba(0,0,0,0.25)] transition-all duration-150 hover:shadow-[4px_4px_10px_rgba(0,0,0,0.3)] active:shadow-[2px_2px_6px_rgba(0,0,0,0.2)]"
              >
                <Video
                  size={22}
                  color="white"
                  fill="white"
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <span className="font-semibold text-[12px] text-white leading-none">
                  発信
                </span>
              </button>
            </div>
          )}
          {!user.videoCallWaiting && user.voiceCallWaiting && (
            <div className="absolute right-1 bottom-0.5 flex gap-1">
              <button
                onClick={handleTwoshotModalOpen}
                className="group relative flex h-12 w-12 flex-col items-center justify-center gap-0 rounded-full bg-gradient-to-br from-blue-300 to-blue-400 shadow-[6px_6px_12px_rgba(0,0,0,0.25)] transition-all duration-150 hover:shadow-[4px_4px_10px_rgba(0,0,0,0.3)] active:shadow-[2px_2px_6px_rgba(0,0,0,0.2)]"
              >
                <Phone
                  size={20}
                  color="white"
                  fill="white"
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <span className="font-semibold text-[12px] text-white">
                  発信
                </span>
              </button>
            </div>
          )}
          {/* いいねボタン（ビデオ通話も音声通話も発信がない場合） */}
          {!user.videoCallWaiting && !user.voiceCallWaiting && (
            <div className="absolute right-1 bottom-0.5 z-20 flex gap-1">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`group relative flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-full shadow-[6px_6px_12px_rgba(0,0,0,0.25)] transition-all duration-150 hover:shadow-[4px_4px_10px_rgba(0,0,0,0.3)] active:shadow-[2px_2px_6px_rgba(0,0,0,0.2)] ${
                  isLiked
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                    : 'bg-gradient-to-br from-pink-300 to-pink-400'
                } ${isLiking ? 'pointer-events-none opacity-50' : ''}`}
                title={isLiked ? 'いいね済み' : 'いいね'}
              >
                <ThumbsUp
                  size={16}
                  color="white"
                  fill="white"
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <div
                  className={`flex flex-col items-center gap-0 ${isLiking ? 'opacity-50' : ''}`}
                >
                  <span className="font-semibold text-[10px] text-white leading-none">
                    いいね
                  </span>
                  <span className="font-semibold text-[10px] text-white leading-none">
                    ({isLiked ? '済み' : '無料'})
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* ユーザー情報 */}
        <div className="mt-1 text-left">
          <div className="flex items-center justify-start gap-1 font-medium text-sm">
            {isOnline ? (
              <span
                className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center"
                aria-label="オンライン中"
              >
                <span className="absolute h-4 w-4 animate-online-ping rounded-full bg-green-400" />
                <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
              </span>
            ) : (
              <span
                className={`h-2 w-2 flex-shrink-0 rounded-full ${onlineStatusColor}`}
                aria-label="オンラインステータス"
              />
            )}
            {!hideUserName && (
              <p className="min-w-0 truncate font-bold text-gray-800">
                {user.userName}
              </p>
            )}
            {metaOrder === 'age-region' ? (
              <>
                <span
                  className={`flex-shrink-0 ${metaTextClassName ?? 'text-xs'}`}
                >
                  {user.age}歳
                </span>
                <span
                  className={`flex-shrink-0 ${metaTextClassName ?? 'text-xs'}`}
                >
                  {getRegionName(user.region)}
                </span>
              </>
            ) : (
              <>
                <span
                  className={`flex-shrink-0 ${metaTextClassName ?? 'text-xs'}`}
                >
                  {getRegionName(user.region)}
                </span>
                <span
                  className={`flex-shrink-0 ${metaTextClassName ?? 'text-xs'}`}
                >
                  {user.age}歳
                </span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* 通話確認モーダル */}
      {modalType === 'video-call' && modalUserInfo && (
        <VideoCallConfirmModal
          isOpen={isModalOpen}
          userInfo={modalUserInfo}
          onClose={closeModal}
          sectionName={sectionName}
        />
      )}
      {modalType === 'voice-call' && modalUserInfo && (
        <VoiceCallConfirmModal
          isOpen={isModalOpen}
          userInfo={modalUserInfo}
          onClose={closeModal}
          sectionName={sectionName}
        />
      )}

      {/* 自己紹介文 */}
      {!hideAbt && user.abt && (
        <p className="mt-1 line-clamp-2 px-1 text-left text-gray-600 text-xs">
          {user.abt}
        </p>
      )}
    </div>
  );
};

export const UserCard = React.memo(
  UserCardComponent,
  (prev, next) =>
    prev.user.userId === next.user.userId &&
    prev.user.isFav === next.user.isFav &&
    prev.user.voiceCallWaiting === next.user.voiceCallWaiting &&
    prev.user.videoCallWaiting === next.user.videoCallWaiting &&
    prev.user.isCalling === next.user.isCalling &&
    prev.user.lastLoginTime === next.user.lastLoginTime &&
    prev.user.isListedOnFleaMarket === next.user.isListedOnFleaMarket &&
    prev.priority === next.priority &&
    prev.hideAbt === next.hideAbt &&
    prev.hideUserName === next.hideUserName &&
    prev.sectionName === next.sectionName,
);
UserCard.displayName = 'UserCard';
