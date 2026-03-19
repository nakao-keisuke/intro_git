import { IconSend, IconX } from '@tabler/icons-react';
// Image component removed (use <img> directly);
// TODO: i18n - import { useTranslations } from '#/i18n';
import { useEffect } from 'react';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import { PRICING_INFO } from '@/constants/pricing';
import { imageUrl } from '@/utils/image';
import { regionText } from '@/utils/region';
import PointShortageModalBase, {
  CALL_POINT_PACKAGES,
} from './PointShortageModalBase';

const lovensePic = '/lovense_pink.webp';

type Props = {
  /** モーダルを閉じる */
  onClose: () => void;
  /** 購入成功後にメッセージを送信するコールバック */
  onPurchaseAndSend: () => void;
  /** 相手のユーザー名 */
  userName: string;
  /** 相手のアバターID */
  avatarId: string;
  /** 送信しようとしていたメッセージ */
  message: string;
  /** 相手の年齢 */
  age?: number | undefined;
  /** 相手の地域 */
  region?: number | string | undefined;
  /** バストサイズ */
  bustSize?: string | undefined;
  /** ラブンス対応 */
  hasLovense?: boolean | undefined;
};

/**
 * メッセージ送信用のポイント不足モーダル
 */
const MessagePointShortageModal = ({
  onClose,
  onPurchaseAndSend,
  userName,
  avatarId,
  message,
  age,
  region,
  bustSize,
  hasLovense,
}: Props) => {
  const t = useTranslations('pointShortage');

  // モーダルが表示されたときにキーボードを閉じる
  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  // pricing.tsから取得したポイント消費量
  const messagePricing = PRICING_INFO.find(
    (item) => item.label === 'メッセージ送信',
  );
  const messagePrice =
    messagePricing && typeof messagePricing.price === 'number'
      ? messagePricing.price
      : 0;

  const subtitle = t('message.pointsRequired', { price: messagePrice });
  const buttonText = t('message.purchaseAndSend');

  const handlePurchaseSuccess = () => {
    onPurchaseAndSend();
  };

  // ヘッダーコンテンツ（プロフィール表示 + 送信しようとしたメッセージ）
  const headerContent = (
    <div className="relative overflow-hidden px-5 pt-3 pb-4">
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
      <div className="relative z-10 flex items-center gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
          <RoundedThumbnail
            avatarId={avatarId}
            deviceCategory="mobile"
            customSize={{ width: 64, height: 64 }}
          />
        </div>
        <div className="flex flex-col gap-0.5">
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
          {/* 年齢・地域 */}
          <div className="flex items-center gap-2 text-white text-xs drop-shadow">
            {region !== undefined && <span>{regionText(region)}</span>}
            {age !== undefined && <span>{age}歳</span>}
          </div>
          {/* バストサイズ・ラブンス */}
          <div className="mt-0.5 flex items-center gap-1">
            {bustSize && bustSize !== '未設定' && (
              <span className="rounded-full bg-pink-100 px-1.5 py-0.5 text-pink-500 text-xs">
                👙{bustSize}
              </span>
            )}
            {hasLovense && (
              <span className="flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-pink-500 text-xs">
                <Image src={lovensePic} alt="Lovense" width={14} height={14} />
                {t('remoteVibeCompatible')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 送信しようとしたメッセージ */}
      <div className="relative z-10 mt-4">
        <p className="mb-1 text-white/80 text-xs">
          {t('message.attemptedMessage')}
        </p>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#C8F0A3] px-4 py-2.5 shadow-md">
          <p className="whitespace-pre-wrap break-words text-gray-800 text-sm">
            {message}
          </p>
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
      source="message_point_shortage"
      sourceUiBase="modal.message_point_shortage"
      icon={IconSend}
      iconClassName="text-pink-500"
    />
  );
};

export default MessagePointShortageModal;
