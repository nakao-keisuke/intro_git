// Image component removed (use <img> directly);
import { defaultAvatarImg } from '@/constants/image';
import { imageUrl } from '@/utils/image';

type Props = {
  readonly id: string;
  readonly priority: boolean;
  readonly size?: number;
};

const Thumbnail = (props: Props) => {
  const size = props.size || 120;

  if (props.id === '') {
    return (
      <div
        className="relative overflow-hidden rounded-[10px]"
        style={{ width: size, height: size }}
      >
        <Image
          src={defaultAvatarImg}
          placeholder="empty"
          priority={false}
          width={size}
          height={size}
          style={{ objectFit: 'cover', marginLeft: 0 }} // 余白を削除
          alt="ユーザー画像"
        />
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[10px]"
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl(props.id)}
        alt="ユーザー画像"
        placeholder="empty"
        quality={100}
        priority={props.priority}
        width={size}
        height={size}
        style={{
          objectFit: 'cover',
          marginLeft: 0,
        }} // 余白を削除
        onError={(e) => {
          // 画像読み込みエラー時にデフォルト画像を設定
          const target = e.target as HTMLImageElement;
          target.src =
            typeof defaultAvatarImg === 'string'
              ? defaultAvatarImg
              : '/default-avatar.jpeg';
        }}
      />
    </div>
  );
};

export default Thumbnail;
