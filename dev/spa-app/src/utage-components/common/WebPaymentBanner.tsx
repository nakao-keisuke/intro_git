// Image component removed (use <img> directly);
import { useSession } from '#/hooks/useSession';
import type React from 'react';
import {
  getWebPaymentBannerUrl,
  shouldShowWebPaymentBanner,
  WEB_PAYMENT_BANNER_IMAGE,
  WEB_PAYMENT_BANNER_IMAGE_FOOTER,
} from '@/utils/webPaymentBanner';

type WebPaymentBannerProps = {
  /** バナー画像のタイプ（header: 通常用, footer: マイページ用） */
  variant?: 'header' | 'footer';
  /** カスタムクラス名（バナー本体に適用） */
  className?: string;
  /** ラッパー要素のクラス名（外側のdivに適用） */
  wrapperClassName?: string;
  /** バナー下に表示するテキスト（2行まで） */
  text?: [string, string];
  /** テキスト部分のスタイル */
  textStyle?: React.CSSProperties;
};

/**
 * Web決済バナーコンポーネント
 * Native版ApplicationID (72: iOS / 76: Android) の場合にのみ表示
 */
export const WebPaymentBanner: React.FC<WebPaymentBannerProps> = ({
  variant = 'header',
  className = '',
  wrapperClassName,
  text,
  textStyle,
}) => {
  const { data: session } = useSession();
  const token = session?.user?.token;

  // 表示条件チェック
  if (!shouldShowWebPaymentBanner() || !token) {
    return null;
  }

  const url = getWebPaymentBannerUrl(token);
  if (!url) {
    return null;
  }

  const imagePath =
    variant === 'footer'
      ? WEB_PAYMENT_BANNER_IMAGE_FOOTER
      : WEB_PAYMENT_BANNER_IMAGE;

  const handleClick = () => {
    window.location.href = url;
  };

  const bannerContent = (
    <div className={`cursor-pointer ${className}`} onClick={handleClick}>
      <Image
        src={imagePath}
        alt="Web決済"
        width={800}
        height={240}
        className="h-auto w-full"
        priority={false}
      />
      {text && (
        <p
          className="px-4 py-3 text-center font-medium text-gray-800 leading-snug"
          style={textStyle}
        >
          {text[0]}
          <br />
          {text[1]}
        </p>
      )}
    </div>
  );

  // wrapperClassNameが指定されている場合は外側のdivでラップ
  if (wrapperClassName) {
    return <div className={wrapperClassName}>{bannerContent}</div>;
  }

  return bannerContent;
};

export default WebPaymentBanner;
