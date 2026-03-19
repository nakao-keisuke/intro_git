import { IconX } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useSession } from '#/hooks/useSession';
// TODO: i18n - import { useTranslations } from '#/i18n';
import { usePartnerInfo } from '@/app/[locale]/message/components/hooks/usePartnerInfo';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import { imageUrl } from '@/utils/image';
import { regionText } from '@/utils/region';
import PointShortageModalBase, {
  CALL_POINT_PACKAGES,
} from './PointShortageModalBase';

const lovensePic = '/lovense_pink.webp';

import { PRICING_INFO } from '@/constants/pricing';

type CallType = 'video:voice' | 'both';

type Props = {
  /** モーダルを閉じる */
  onClose: () => void;
  /** 購入成功後に通話を開始するコールバック */
  onPurchaseAndCall: () => void;
  /** 通話タイプ */
  callType: CallType;
  /** 相手のユーザーID */
  partnerId?: string | undefined;
  /** 相手のユーザー名 */
  userName: string;
  /** 相手のアバターID */
  avatarId: string;
  /** 相手の年齢 */
  age?: number | undefined;
  /** 相手の地域 */
  region?: number | string | undefined;
  /** ラブンス対応 */
  hasLovense?: boolean | undefined;
  /** バストサイズ */
  bustSize?: string | undefined;
};

/**
 * 通話発信用のポイント不足モーダル
 */
const CallPointShortageModal = ({
  onClose,
  onPurchaseAndCall,
  callType,
  partnerId,
  userName,
  avatarId,
  age,
  region,
  hasLovense,
  bustSize,
}: Props) => {
  const t = useTranslations('pointShortage');
  const { data: session } = useSession();
  const myId = session?.user?.id;
  const { partner } = usePartnerInfo({
    partnerId: partnerId ?? '',
    ...(myId && { myId }),
    enabled: Boolean(partnerId && myId),
  });

  const displayAge = age ?? partner?.age;
  const displayRegion = region ?? partner?.region;
  const displayHasLovense = hasLovense ?? partner?.hasLovense;
  const displayBustSize = bustSize ?? partner?.bustSize;

  // pricing.tsから取得したポイント消費量
  const voiceCallPricing = PRICING_INFO.find(
    (item) => item.label === '音声通話',
  );
  const videoCallPricing = PRICING_INFO.find(
    (item) => item.label === 'ビデオ通話',
  );

  // 常に両方のポイント消費を表示
  const subtitle = (
    <>
      {t('call.voiceCallConsumption', { price: voiceCallPricing?.price ?? 0 })}
      <br />
      {t('call.videoCallConsumption', { price: videoCallPricing?.price ?? 0 })}
    </>
  );
  const buttonText = t('call.purchaseAndCall');

  const handlePurchaseSuccess = () => {
    onPurchaseAndCall();
  };

  // ヘッダーコンテンツ（プロフィール表示）
  const headerContent = (
    <div className="relative overflow-hidden px-5 pt-3 pb-2">
      {avatarId && (
        <Image
          src={imageUrl(avatarId)}
          alt=""
          fill
          className="absolute inset-0 object-cover blur-[3px]"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/30" />

      {/* 閉じるボタン */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 z-10 rounded-full p-1 transition-colors hover:bg-white/20"
        aria-label={t('close')}
      >
        <IconX size={28} className="text-white drop-shadow" />
      </button>

      {/* プロフィール */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-1.5 h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-md">
          <RoundedThumbnail
            avatarId={avatarId}
            deviceCategory="mobile"
            customSize={{ width: 64, height: 64 }}
          />
        </div>
        <div className="flex items-center gap-1">
          <span
            className="relative flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center"
            aria-label={t('online')}
          >
            <span className="absolute h-3.5 w-3.5 animate-online-ping rounded-full bg-green-400" />
            <span className="relative h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          </span>
          <h3 className="font-bold text-base text-white drop-shadow">
            {userName}
          </h3>
        </div>
        {/* 年齢・地域・ラブンス・バストサイズ */}
        <div className="mt-0.5 flex flex-col items-center gap-1 text-white text-xs drop-shadow">
          <div className="flex items-center gap-2">
            {displayRegion !== undefined && (
              <span>{regionText(displayRegion)}</span>
            )}
            {displayAge !== undefined && <span>{displayAge}歳</span>}
          </div>
          <div className="flex items-center gap-1">
            {displayBustSize && displayBustSize !== '未設定' && (
              <span className="rounded-full bg-pink-100 px-1.5 py-0.5 text-pink-500 text-xs">
                👙{displayBustSize}
              </span>
            )}
            {displayHasLovense && (
              <span className="flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-pink-500 text-xs">
                <Image src={lovensePic} alt="Lovense" width={14} height={14} />
                {t('remoteVibeCompatible')}
              </span>
            )}
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
      source="call_point_shortage"
      sourceUiBase="modal.call_point_shortage"
    />
  );
};

export default CallPointShortageModal;
