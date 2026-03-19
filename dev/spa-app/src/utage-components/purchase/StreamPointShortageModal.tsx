import {
  IconLock,
  IconPlayerPlay,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
// Image component removed (use <img> directly);
// TODO: i18n - import { useTranslations } from '#/i18n';
import { useState } from 'react';
import FallbackImage from '@/components/common/FallbackImage';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import { VIDEO_CHAT_VIEWING_PRICE } from '@/constants/pricing';
import { imageUrl, imageUrlForAgoraScreenshot } from '@/utils/image';
import { regionText } from '@/utils/region';
import PointShortageModalBase, {
  CALL_POINT_PACKAGES,
} from './PointShortageModalBase';

const lovensePic = '/lovense_pink.webp';

type Props = {
  /** モーダルを閉じる */
  onClose: () => void;
  /** 購入成功後に配信を視聴するコールバック */
  onPurchaseAndWatch: () => void;
  /** 配信者のユーザー名 */
  userName: string;
  /** 配信者のアバターID */
  avatarId: string;
  /** 配信のサムネイルID（Agoraスクリーンショット） */
  thumbnailImageId?: string | undefined;
  /** 視聴者人数（配信者を除いた数） */
  viewerCount?: number | undefined;
  /** 配信者の年齢 */
  age?: number | undefined;
  /** 配信者の地域 */
  region?: number | string | undefined;
  /** バストサイズ */
  bustSize?: string | undefined;
  /** ラブンス対応 */
  hasLovense?: boolean | undefined;
};

/**
 * ライブ配信視聴用のポイント不足モーダル
 */
const StreamPointShortageModal = ({
  onClose,
  onPurchaseAndWatch,
  userName,
  avatarId,
  thumbnailImageId,
  viewerCount,
  age,
  region,
  bustSize,
  hasLovense,
}: Props) => {
  const t = useTranslations('pointShortage');
  const subtitle = null;
  const buttonText = t('stream.purchaseAndWatch');

  const handlePurchaseSuccess = () => {
    onPurchaseAndWatch();
  };

  // サムネイル画像URL（Agoraスクリーンショット or アバター）
  const avatarUrl = imageUrl(avatarId);
  const thumbnailUrl =
    thumbnailImageId && thumbnailImageId !== '-1' && thumbnailImageId !== '0'
      ? imageUrlForAgoraScreenshot(thumbnailImageId)
      : avatarUrl;

  // 画像の読み込み状態（読み込み完了までぼかし表示）
  const [imageLoaded, setImageLoaded] = useState(false);

  // ヘッダーコンテンツ（サムネイル + ロック表示 + 配信者情報オーバーレイ）
  const headerContent = (
    <div className="relative overflow-hidden">
      {/* 背景：サムネイル画像 + グラデーションオーバーレイ */}
      <div className="relative h-[220px]">
        <FallbackImage
          src={thumbnailUrl}
          alt=""
          fill
          className={`object-cover ${imageLoaded ? '' : 'scale-105 blur-md'}`}
          priority
          onLoad={() => setImageLoaded(true)}
          fallbackSrc={avatarUrl}
        />
        {/* グラデーションオーバーレイ（紫〜ピンク） */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/40 via-purple-500/30 to-pink-400/40" />

        {/* LIVEバッジ（左上） */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 font-bold text-white text-xs shadow-md">
          <div className="relative h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
            <span className="relative block h-2 w-2 rounded-full bg-white" />
          </div>
          <span>{t('stream.live')}</span>
        </div>

        {/* 閉じるボタン（右上） */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-white/20 p-1 transition-colors hover:bg-white/30"
          aria-label={t('close')}
        >
          <IconX size={24} className="text-white" />
        </button>

        {/* 中央：ロックアイコン + メッセージ */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-10 text-white">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <IconLock size={32} className="text-white" />
          </div>
          <p className="px-4 text-center font-bold text-base drop-shadow">
            {t('stream.pointsRequiredToWatch')}
          </p>
          <p className="mt-1 px-4 text-center text-xs drop-shadow">
            {t('stream.consumptionNote', { price: VIDEO_CHAT_VIEWING_PRICE })}
          </p>

          {/* 視聴者人数 */}
          <div className="mt-2 flex items-center gap-3">
            {viewerCount !== undefined && viewerCount >= 0 && (
              <div className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-xs backdrop-blur-sm">
                <IconUsers size={14} />
                <span>{t('stream.viewerCount', { count: viewerCount })}</span>
              </div>
            )}
          </div>
        </div>

        {/* 配信者情報カード（サムネイル上にオーバーレイ） */}
        <div className="absolute right-0 bottom-0 left-0 rounded-t-2xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
              <RoundedThumbnail
                avatarId={avatarId}
                deviceCategory="mobile"
                customSize={{ width: 44, height: 44 }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {/* オンライン中の緑丸アニメーション */}
                <span
                  className="relative flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center"
                  aria-label={t('online')}
                >
                  <span className="absolute h-3.5 w-3.5 animate-online-ping rounded-full bg-green-400" />
                  <span className="relative h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </span>
                <span className="truncate font-bold text-white">
                  {userName}
                </span>
              </div>
              {/* 年齢・地域・バストサイズ・ラブンス（横並び） */}
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                {region !== undefined && (
                  <span className="text-white text-xs">
                    {regionText(region)}
                  </span>
                )}
                {age !== undefined && (
                  <span className="text-white text-xs">{age}歳</span>
                )}
                {bustSize && bustSize !== '未設定' && (
                  <span className="rounded-full bg-pink-100 px-1.5 py-0.5 text-pink-500 text-xs">
                    👙{bustSize}
                  </span>
                )}
                {hasLovense && (
                  <div className="flex items-center gap-1 rounded-full bg-pink-400 px-1.5 py-0.5 text-white text-xs">
                    <Image
                      src={lovensePic}
                      alt="Lovense"
                      width={14}
                      height={14}
                      className="rounded-full bg-white"
                    />
                    <span className="text-white text-xs">
                      {t('remoteVibeCompatible')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PointShortageModalBase
      onClose={onClose}
      onPurchaseSuccess={handlePurchaseSuccess}
      subtitle={subtitle}
      buttonText={buttonText}
      headerContent={headerContent}
      packages={CALL_POINT_PACKAGES}
      popularMoney={4900}
      dealPoint={12000}
      source="stream_live_point_shortage"
      sourceUiBase="modal.stream_point_shortage"
      icon={IconPlayerPlay}
      iconClassName="text-purple-500 border-2 border-purple-500 rounded-full p-1"
      hideTitle
    />
  );
};

export default StreamPointShortageModal;
