// Image component removed (use <img> directly);
import type React from 'react';
import RoundedThumbnail from '@/components/RoundedThumbnail';

const _moviePic = '/chat/movie.webp';
const heartPic = '/heart.webp';
const heartWPic = '/heart_w.webp';

import { IconPlayerPlayFilled } from '@tabler/icons-react';
import type { galleryListUserInfo } from '@/hooks/useGalleryData.hook';
import styles from '@/styles/Gallery.module.css';
import { imageUrl } from '@/utils/image';

type MovieItemProps = {
  gallery: galleryListUserInfo;
  onMovieClick: () => void;
  onFavoriteClick: (e: React.MouseEvent) => void;
};

const formatUserName = (userName: string) => {
  return userName.length > 4
    ? `${[...userName].slice(0, 4).join('')}...`
    : userName;
};

const MovieItem: React.FC<MovieItemProps> = ({
  gallery,
  onMovieClick,
  onFavoriteClick,
}) => (
  <li>
    <div className={styles.wrapper} onClick={onMovieClick}>
      <div className={styles.images}>
        <Image
          src={imageUrl(gallery.fileId)}
          fill
          sizes="(max-width: 768px) 50vw, 
                 (max-width: 1200px) 33vw,
                 25vw"
          style={{
            objectFit: 'cover',
            borderRadius: '8px',
          }}
          alt={`${gallery.userName}の動画`}
        />
      </div>
      {/* 未開封（=未購入）判定ができる場合のみモザイクを表示 */}
      {Boolean(gallery.sentDate) && <div className={styles.overlay}></div>}
      <div className={styles.saisei}>
        <div className={styles.saiseiIcon}>
          <IconPlayerPlayFilled size={20} />
        </div>
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteClick(e);
        }}
        className={styles.heart}
      >
        {gallery.isFavorite ? (
          <Image src={heartPic} width={20} height={20} alt="お気に入りする" />
        ) : (
          <Image src={heartWPic} width={20} height={20} alt="お気に入り済み" />
        )}
      </div>

      <div
        className={styles.name}
        style={{
          position: 'absolute',
          bottom: 0,
          marginBottom: 3,
          marginLeft: 50,
        }}
      >
        {formatUserName(gallery.userName)} /
        <span className={styles.age}> {gallery.age}歳</span>
      </div>
      <a
        href={`/profile/unbroadcaster/${gallery.userId}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.thumbnail}>
          <RoundedThumbnail
            avatarId={gallery.avaId}
            deviceCategory="mobile"
            customSize={{ width: 45, height: 45 }}
          />
        </div>
      </a>
    </div>
  </li>
);

export default MovieItem;
