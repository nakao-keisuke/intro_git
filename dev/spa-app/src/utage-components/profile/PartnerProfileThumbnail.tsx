import FallbackImage from '@/components/common/FallbackImage';
import { DEFAULT_AVATAR_PATH } from '@/constants/image';
import { imageUrl } from '@/utils/image';

type Props = {
  id: string;
  className: string | undefined;
  index: number;
};

const PartnerProfileThumbnail = ({ id, className, index }: Props) => {
  return (
    <div className={className}>
      <FallbackImage
        src={imageUrl(id)}
        placeholder="empty"
        width={60}
        height={60}
        style={{ objectFit: 'cover' }}
        priority={index < 7}
        alt="ユーザー画像"
        fallbackSrc={DEFAULT_AVATAR_PATH}
      />
    </div>
  );
};

export default PartnerProfileThumbnail;
