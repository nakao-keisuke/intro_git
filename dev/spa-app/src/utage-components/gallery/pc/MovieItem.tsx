// Image component removed (use <img> directly);
import type React from 'react';
import RoundedThumbnail from '@/components/RoundedThumbnail';

const moviePic = '/chat/movie.webp';
const heartPic = '/heart.webp';
const heartWPic = '/heart_w.webp';

import type { galleryListUserInfo } from '@/features/gallery/index.hook';
import styles from '@/styles/PCGallery.module.css';
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

const PCMovieItem: React.FC<MovieItemProps> = ({
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
      <Image
        src={moviePic}
        width={40}
        height={40}
        className={styles.saisei}
        alt="再生する"
      />
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
            avatarId={gallery.avatarId}
            deviceCategory="mobile"
            customSize={{ width: 45, height: 45 }}
          />
        </div>
      </a>
    </div>
  </li>
);

export default PCMovieItem;
