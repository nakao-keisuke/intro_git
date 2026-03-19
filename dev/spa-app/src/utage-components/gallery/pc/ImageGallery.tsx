// Image component removed (use <img> directly);
import { useState } from 'react';
import AppPayNoModal from '@/app/components/AppPayNoModal';
import ImageModal from '@/components/chat/chatcontent/ImageModal';
import {
  GET_GALLERY_FAVORITE,
  PURCHASE_IMAGE,
  SEND_IMAGE_REQUEST,
} from '@/constants/endpoints';
import type {
  galleryListUserInfo,
  rankedMeetPerson,
} from '@/features/gallery/index.hook';
import styles from '@/styles/PCGallery.module.css';
import { imageUrl } from '@/utils/image';
import { postToNext } from '@/utils/next';
import ImageItem from './ImageItem';

const beginnerPic = '/situation.icon/beginner_g.webp';

import { trackEvent } from '@/utils/eventTracker';

type ImageGalleryProps = {
  openImages: galleryListUserInfo[];
  unOpenImages: galleryListUserInfo[];
  imageRankingList: rankedMeetPerson[];
};

const PCImageGallery: React.FC<ImageGalleryProps> = ({
  openImages,
  unOpenImages,
  imageRankingList,
}) => {
  const [modalImageOpen, setModalImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] =
    useState<galleryListUserInfo | null>(null);
  const [openImageList, setOpenImageList] = useState(openImages);
  const [imageRankingUsers, setImageRankingUsers] = useState(imageRankingList);
  const [unOpenImageList, setUnOpenImageList] = useState(unOpenImages);
  const [isLoading, setIsLoading] = useState(false);

  const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] = useState(false);

  const _purchaseImage = async (gallery: galleryListUserInfo) => {
    setIsLoading(true);
    const response = await postToNext<{}>(PURCHASE_IMAGE, {
      imageId: gallery.fileId,
    });
    if (response.type === 'error') {
      if (response.notEnoughPoint) {
        setNotEnoughPointModalOpen(true);
      }
      setIsLoading(false);
      return;
    }
    trackEvent('COMPLETE_PURCHASE_IMAGE_GALLERY');
    localStorage.setItem('purchaseGalleryItem', 'true');
    // 購入した画像を未開封リストから削除し開封済みリストの先頭に追加
    setUnOpenImageList((prev) =>
      prev.filter((item) => item.fileId !== gallery.fileId),
    );
    const newImage: galleryListUserInfo = {
      fileId: gallery.fileId,
      userId: gallery.userId,
      userName: gallery.userName,
      avatarId: gallery.avatarId,
      age: gallery.age,
      isFavorite: false, // 初期状態はお気に入りではない
    };
    setOpenImageList((prev) => {
      const updatedList = [...prev];
      updatedList.unshift(newImage); // 先頭に追加
      return updatedList;
    });

    setIsLoading(false);
    setSelectedImage(newImage);
    setModalImageOpen(true);
  };

  const addToFavorites = async (gallery: galleryListUserInfo) => {
    const newFavoriteStatus = !gallery.isFavorite;
    try {
      const response = await postToNext<{}>(GET_GALLERY_FAVORITE, {
        is_favorite: newFavoriteStatus,
        file_id: gallery.fileId,
      });
      if (response.type === 'success') {
        const updatedMovies = openImageList.map((image) =>
          image.fileId === gallery.fileId
            ? { ...image, isFavorite: newFavoriteStatus }
            : image,
        );
        setOpenImageList(updatedMovies);
      }
    } catch (error) {
      console.error('Failed to add to favorites:', error);
    }
  };

  const sendImageRequest = async (user: rankedMeetPerson) => {
    try {
      const response = await postToNext<{}>(SEND_IMAGE_REQUEST, {
        rcv_id: user.user_id,
      });
      if (response.type === 'success') {
        alert('画像リクエストを送信しました');
        trackEvent('COMPLETE_SEND_IMAGE_FILE_REQUEST');

        // 送信済みのユーザーはリクエストボタンを非表示にする
        setImageRankingUsers(
          imageRankingUsers.map((userInfo) =>
            userInfo.user_id === user.user_id
              ? { ...userInfo, isSendRequest: true }
              : userInfo,
          ),
        );
      }
    } catch (error) {
      console.error('video request:', error);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation(); // 伝播を停止
  };

  const [isEnabled, setIsEnabled] = useState(false);

  const handleFavoriteChange = async () => {
    setIsEnabled(!isEnabled);
  };

  const parseTimestamp = (timestamp: string): Date => {
    const year = Number(timestamp.slice(0, 4));
    const month = Number(timestamp.slice(4, 6)) - 1; // months are 0-based in JavaScript Date
    const day = Number(timestamp.slice(6, 8));
    const hour = Number(timestamp.slice(8, 10));
    const minute = Number(timestamp.slice(10, 12));
    const second = Number(timestamp.slice(12, 14));
    const parsedDate = new Date(
      Date.UTC(year, month, day, hour, minute, second),
    );

    return parsedDate;
  };

  const imageRankingItems = imageRankingUsers.map((user) => {
    const determineThumbnailClass = (rank?: number) => {
      switch (rank) {
        case 1:
          return `${styles.rank} ${styles.gold} `;
        case 2:
          return `${styles.rank} ${styles.silver}`;
        case 3:
          return `${styles.rank} ${styles.bronze}`;
        default:
          return;
      }
    };

    const thumbnailClass = determineThumbnailClass(user.rank);

    const determineOnlineStatusColor = (
      lastOnlineTimestamp: string,
    ): string => {
      const currentTime = Date.now();
      const lastOnlineTime = parseTimestamp(lastOnlineTimestamp);

      if (!lastOnlineTime) {
        return 'status-grey'; // default color in case of error or undefined
      }

      const diffTime = currentTime - lastOnlineTime.getTime();

      if (diffTime <= 8 * 60 * 60 * 1000) {
        // online within the last 8 hours
        return 'status-green'; // online
      } else if (diffTime <= 24 * 60 * 60 * 1000) {
        // online within the last 24 hours
        return 'status-orange'; // online within 24 hours
      } else {
        // online more than 24 hours ago
        return 'status-grey'; // online more than 24 hours ago
      }
    };

    return (
      <li key={user.user_id}>
        <a
          href={`/profile/unbroadcaster/${user.user_id}`}
          onClick={stopPropagation}
          className={styles.unOpenwrapper}
        >
          {unOpenImageList.some(
            (unOpenedImage) => unOpenedImage.userId === user.user_id,
          ) && (
            <div className={`${styles.videoRecievedRibbon} `}>
              <span>受取済み</span>
            </div>
          )}
          <div className={thumbnailClass}>
            <Image
              src={imageUrl(user.ava_id)}
              placeholder="empty"
              width={90}
              height={90}
              style={{ objectFit: 'cover' }}
              alt="画像"
            />
            {isLoading && <div className={styles.loader} />}
          </div>
          {user.is_new && (
            <div className={styles.beginner}>
              <Image src={beginnerPic} width={13} height={19} alt="新人" />
            </div>
          )}
        </a>
        <div className={styles.userStatus}>
          <div
            className={`${
              styles[determineOnlineStatusColor(user.last_login_time)]
            }`}
          />
          <div className={styles.unName}>
            {user.age}歳　{user.region}
          </div>
        </div>
        <div
          onClick={(e) => {
            stopPropagation(e);
            sendImageRequest(user);
          }}
          className={styles.imageRequest}
          style={{
            display: user.isSendRequest ? 'none' : 'block',
          }}
        >
          画像リクエスト
        </div>
      </li>
    );
  });

  return (
    <>
      <div className={styles.all}>
        <div className={styles.label}>送信画像が人気のユーザー</div>
        <a href={'/gallery/ranking?type=image'} onClick={stopPropagation}>
          <div className={styles.all}>すべて見る</div>
        </a>
      </div>
      <ul className={styles.unOpenlist}>{imageRankingItems}</ul>

      <div className={styles.all}>
        <div className={styles.label}>開封済みの画像</div>
        <div className={styles.favorite}>
          <div className={styles.favoLabel}>お気に入り</div>
          <div className={styles.toggle}>
            <label>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={handleFavoriteChange}
                className={styles.toggleSwitch}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
      </div>
      <ul className={styles.list}>
        {isEnabled
          ? openImageList
              .filter((image) => image.isFavorite)
              .map((gallery, index) => (
                <ImageItem
                  key={index}
                  gallery={gallery}
                  onImageClick={() => {
                    setModalImageOpen(true);
                    setSelectedImage(gallery);
                  }}
                  onFavoriteClick={(e) => {
                    stopPropagation(e);
                    addToFavorites(gallery);
                  }}
                />
              ))
          : openImageList.map((gallery, index) => (
              <ImageItem
                key={index}
                gallery={gallery}
                onImageClick={() => {
                  setModalImageOpen(true);
                  setSelectedImage(gallery);
                }}
                onFavoriteClick={(e) => {
                  stopPropagation(e);
                  addToFavorites(gallery);
                }}
              />
            ))}
      </ul>
      {modalImageOpen && selectedImage && (
        <ImageModal
          modalOpen
          imageSrc={imageUrl(selectedImage.fileId)}
          closeModal={() => {
            setModalImageOpen(false);
            setSelectedImage(null);
          }}
        />
      )}
      {notEnoughPointModalOpen && (
        <AppPayNoModal onClose={() => setNotEnoughPointModalOpen(false)} />
      )}
    </>
  );
};

export default PCImageGallery;
