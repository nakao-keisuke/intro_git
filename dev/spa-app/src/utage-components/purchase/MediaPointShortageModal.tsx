import { IconLock, IconPhoto, IconVideo, IconX } from '@tabler/icons-react';
// Image component removed (use <img> directly);
// TODO: i18n - import { useTranslations } from '#/i18n';
import { useState } from 'react';
import FallbackImage from '@/components/common/FallbackImage';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import { PRICING_INFO } from '@/constants/pricing';
import { regionText } from '@/utils/region';
import PointShortageModalBase, {
  CALL_POINT_PACKAGES,
} from './PointShortageModalBase';

const lovensePic = '/lovense_pink.webp';

type MediaType = 'video' | 'image';

/** メディアタイプごとの設定（翻訳キーを含む） */
const MEDIA_CONFIG = {
  video: {
    priceLabel: '動画開封', // PRICING_INFO照合用（日本語固定）
    defaultPrice: 120,
    labelKey: 'media.video' as const,
    buttonTextKey: 'media.purchaseAndWatchVideo' as const,
    source: 'video_point_shortage',
    sourceUiBase: 'modal.media_point_shortage.video',
    icon: IconVideo,
  },
  image: {
    priceLabel: '画像開封', // PRICING_INFO照合用（日本語固定）
    defaultPrice: 75,
    labelKey: 'media.image' as const,
    buttonTextKey: 'media.purchaseAndViewImage' as const,
    source: 'image_point_shortage',
    sourceUiBase: 'modal.media_point_shortage.image',
    icon: IconPhoto,
  },
} as const;

type Props = {
  /** メディアタイプ（動画 or 画像） */
  mediaType: MediaType;
  /** サムネイルのURL */
  thumbnailUrl: string;
  /** モーダルを閉じる */
  onClose: () => void;
  /** 購入成功後にメディアを表示するコールバック */
  onPurchaseAndView: () => void;
  /** 送信者のユーザー名（オプション） - exactOptionalPropertyTypes対応 */
  userName?: string | undefined;
  /** 送信者のアバターID（オプション） - exactOptionalPropertyTypes対応 */
  avatarId?: string | undefined;
  /** 送信者の年齢（オプション） - exactOptionalPropertyTypes対応 */
  age?: number | undefined;
  /** 送信者の地域（オプション） */
  region?: number | string | undefined;
  /** バストサイズ（オプション） */
  bustSize?: string | undefined;
  /** ラブンス対応（オプション） */
  hasLovense?: boolean | undefined;
};

/**
 * 動画・画像閲覧用のポイント不足モーダル
 */
const MediaPointShortageModal = ({
  mediaType,
  thumbnailUrl,
  onClose,
  onPurchaseAndView,
  userName,
  avatarId,
  age,
  region,
  bustSize,
  hasLovense,
}: Props) => {
  const t = useTranslations('pointShortage');
  const config = MEDIA_CONFIG[mediaType];
  const label = t(config.labelKey);
  const buttonText = t(config.buttonTextKey);

  // pricing.tsから価格を取得
  const pricingInfo = PRICING_INFO.find(
    (item) => item.label === config.priceLabel,
  );
  const price =
    pricingInfo && typeof pricingInfo.price === 'number'
      ? pricingInfo.price
      : config.defaultPrice;

  // 画像の読み込み状態（読み込み完了までぼかし表示）
  const [imageLoaded, setImageLoaded] = useState(false);

  // ユーザー情報があるかどうか
  const hasUserInfo = Boolean(userName && avatarId);

  // ヘッダーコンテンツ（サムネイル + ロック表示 + ユーザー情報オーバーレイ）
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
          fallbackSrc={thumbnailUrl}
        />
        {/* グラデーションオーバーレイ（紫〜ピンク） */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/40 via-purple-500/30 to-pink-400/40 backdrop-blur-sm" />

        {/* メディアタイプバッジ（左上） */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-md bg-pink-500 px-2 py-1 font-bold text-white text-xs shadow-md">
          {mediaType === 'video' ? (
            <IconVideo size={14} />
          ) : (
            <IconPhoto size={14} />
          )}
          <span>{label}</span>
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
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-white ${hasUserInfo ? 'pb-10' : ''}`}
        >
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <IconLock size={32} className="text-white" />
          </div>
          <p className="px-4 text-center font-bold text-base drop-shadow">
            {t('media.pointsRequiredToView', { label })}
          </p>
          <p className="mt-1 px-4 text-center text-xs drop-shadow">
            {t('media.consumptionNote', { label, price })}
          </p>
        </div>

        {/* ユーザー情報カード（サムネイル上にオーバーレイ）- ユーザー情報がある場合のみ表示 */}
        {hasUserInfo && avatarId && (
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
                    <span className="text-white text-xs">
                      {t('ageYears', { age })}
                    </span>
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
        )}
      </div>
    </div>
  );

  return (
    <PointShortageModalBase
      onClose={onClose}
      onPurchaseSuccess={onPurchaseAndView}
      subtitle={null}
      buttonText={buttonText}
      headerContent={headerContent}
      packages={CALL_POINT_PACKAGES}
      popularMoney={4900}
      dealPoint={12000}
      source={config.source}
      sourceUiBase={config.sourceUiBase}
      icon={config.icon}
      iconClassName="text-pink-500"
      hideTitle
    />
  );
};

export default MediaPointShortageModal;
