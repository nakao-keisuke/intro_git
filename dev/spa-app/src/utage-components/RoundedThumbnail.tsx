// Image component removed (use <img> directly);
import { useState } from 'react';
import { defaultAvatarImg } from '@/constants/image';
import type { DeviceCategory } from '@/types/DeviceCategory';
import { imageUrl } from '@/utils/image';

const RoundedThumbnail = (props: {
  customSize?: { width: number; height: number };
  avatarId?: string;
  deviceCategory?: DeviceCategory;
  customQuality?: number;
  priority?: boolean;
  onClick?: () => void;
}) => {
  const [hasError, setHasError] = useState(false);

  // デフォルトのwidthとheightを指定
  const defaultMobileWidth = 60;
  const defaultMobileHeight = 60;
  // customSizeが指定されていればそれを使用、そうでなければデフォルトサイズを使用
  const width =
    props.customSize?.width ||
    (props.deviceCategory === 'mobile' ? defaultMobileWidth : 180);
  const height =
    props.customSize?.height ||
    (props.deviceCategory === 'mobile' ? defaultMobileHeight : 180);

  // 画像ソース決定（エラー時はデフォルト画像）
  const imageSrc =
    !props.avatarId || hasError ? defaultAvatarImg : imageUrl(props.avatarId);

  return (
    <div
      className="relative items-center left-1/2 top-0 -translate-x-1/2 self-center overflow-hidden origin-center cursor-pointer"
      onClick={props.onClick}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <Image
        src={imageSrc}
        placeholder="empty"
        width={width}
        height={height}
        quality={props.deviceCategory === 'mobile' ? 50 : 75}
        className="rounded-full object-cover"
        style={{
          marginLeft: 0,
          width: '100%',
          height: '100%',
        }}
        alt="ユーザー画像"
        priority={props.priority ?? false}
        onError={() => {
          // Next.js Image最適化対応：stateでエラーを管理
          setHasError(true);
        }}
      />
    </div>
  );
};

export default RoundedThumbnail;
