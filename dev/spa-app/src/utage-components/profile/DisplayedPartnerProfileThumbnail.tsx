import FallbackImage from '@/components/common/FallbackImage';
import { DEFAULT_AVATAR_PATH } from '@/constants/image';
import { imageUrl } from '@/utils/image';

type Props = {
  id: string;
  className: string | undefined;
  index: number;
};

const DisplayedPartnerProfileThumbnail = ({ id, className, index }: Props) => {
  return (
    <div className={className}>
      <FallbackImage
        src={imageUrl(id)}
        placeholder="empty"
        fill
        style={{ objectFit: 'cover' }}
        priority={index === 0}
        alt="ユーザー画像"
        fallbackSrc={DEFAULT_AVATAR_PATH}
      />
    </div>
  );
};

export default DisplayedPartnerProfileThumbnail;
