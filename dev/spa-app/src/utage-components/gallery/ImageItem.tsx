// Image component removed (use <img> directly);
import type React from 'react';
import RoundedThumbnail from '@/components/RoundedThumbnail';

const heartPic = '/heart.webp';
const heartWPic = '/heart_w.webp';

import type { galleryListUserInfo } from '@/hooks/useGalleryData.hook';
import styles from '@/styles/Gallery.module.css';
import { imageUrl } from '@/utils/image';

type ImageItemProps = {
  gallery: galleryListUserInfo;
  onImageClick: () => void;
  onFavoriteClick: (e: React.MouseEvent) => void;
};

const formatUserName = (userName: string) => {
  return userName.length > 4
    ? `${[...userName].slice(0, 4).join('')}...`
    : userName;
};

const ImageItem: React.FC<ImageItemProps> = ({
  gallery,
  onImageClick,
  onFavoriteClick,
}) => (
  <li>
    <div className={styles.wrapper} onClick={onImageClick}>
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
        alt={`${gallery.userName}の画像`}
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
          <div>
            <RoundedThumbnail
              avatarId={gallery.avaId}
              deviceCategory="mobile"
              customSize={{ width: 45, height: 45 }}
            />
          </div>
        </div>
      </a>
    </div>
  </li>
);

export default ImageItem;
