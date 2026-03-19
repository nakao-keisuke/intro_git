// Image component removed (use <img> directly);
import { useSession } from '#/hooks/useSession';
import { getProfileStoryThumbnailUrl } from '@/utils/image';

type Props = {
  id: string;
  className: string | undefined;
  index: number;
  applicationId?: string;
};

const PartnerProfileMovieThumbnail = ({
  id,
  className,
  index,
  applicationId,
}: Props) => {
  const session = useSession();
  const token = session.data?.user.token;

  return (
    <div className={className}>
      {token && (
        <Image
          src={getProfileStoryThumbnailUrl({
            applicationId: applicationId ?? '',
            fileId: id,
            token,
          })}
          placeholder="empty"
          width={60}
          height={60}
          style={{ objectFit: 'cover' }}
          priority={index < 7}
          alt="ユーザー画像"
        />
      )}
    </div>
  );
};

export default PartnerProfileMovieThumbnail;
