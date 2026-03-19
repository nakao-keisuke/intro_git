// Image component removed (use <img> directly);
import { useState } from 'react';
import FullscreenVideoPlayer from '@/components/gallery/FullscreenVideoPlayer';
import { GET_GALLERY_FAVORITE, PURCHASE_VIDEO } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import styles from '@/styles/PCGallery.module.css';
import type { ResponseData } from '@/types/NextApi';
import { imageUrl } from '@/utils/image';

const beginnerPic = '/situation.icon/beginner_g.webp';

import AppPayNoModal from '@/app/components/AppPayNoModal';
import type {
  galleryListUserInfo,
  rankedMeetPerson,
} from '@/features/gallery/index.hook';
import { useRequest } from '@/hooks/useRequest';
import { trackEvent } from '@/utils/eventTracker';
import MovieItem from './MovieItem';

type MoviesGalleryProps = {
  openMovies: galleryListUserInfo[];
  unOpenMovies: galleryListUserInfo[];
  videoRankingList: rankedMeetPerson[];
};

const PCMoviesGallery: React.FC<MoviesGalleryProps> = ({
  openMovies,
  unOpenMovies,
  videoRankingList,
}) => {
  const [modalMovieOpen, setModalMovieOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] =
    useState<galleryListUserInfo | null>(null);
  const [openMovieList, setOpenMovieList] = useState(openMovies);
  const [videoRankingUsers, setVideoRankingUsers] = useState(videoRankingList);
  const [unOpenMovieList, setUnOpenMovieList] = useState(unOpenMovies);
  const [isLoading, setIsLoading] = useState(false);
  const { requestVideo } = useRequest();

  const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] = useState(false);

  const _purchaseVideo = async (gallery: galleryListUserInfo) => {
    setIsLoading(true);
    const httpClient = new ClientHttpClient();
    const response = await httpClient.post<ResponseData<Record<string, never>>>(
      PURCHASE_VIDEO,
      {
        fileId: gallery.fileId,
      },
    );
    if (response.type === 'error') {
      if (response.notEnoughPoint) {
        setNotEnoughPointModalOpen(true);
      }
      setIsLoading(false);
      return;
    }
    trackEvent('COMPLETE_PURCHASE_VIDEO_GALLERY');
    localStorage.setItem('purchaseGalleryItem', 'true');
    // 購入した動画を未開封リストから削除し開封済みリストに追加
    setUnOpenMovieList((prev) =>
      prev.filter((item) => item.fileId !== gallery.fileId),
    );
    const newMovie: galleryListUserInfo = {
      fileId: gallery.fileId,
      userId: gallery.userId,
      userName: gallery.userName,
      avatarId: gallery.avatarId,
      age: gallery.age,
      isFavorite: false, // 初期状態はお気に入りではない
    };
    setOpenMovieList((prev) => {
      const updatedList = [...prev];
      updatedList.unshift(newMovie); // 先頭に追加
      return updatedList;
    });

    setIsLoading(false);
    setSelectedMovie(newMovie);
    setModalMovieOpen(true); // モーダルを開く
  };

  const addToFavorites = async (gallery: galleryListUserInfo) => {
    const newFavoriteStatus = !gallery.isFavorite;
    try {
      const httpClient = new ClientHttpClient();
      const response = await httpClient.post<
        ResponseData<Record<string, never>>
      >(GET_GALLERY_FAVORITE, {
        is_favorite: newFavoriteStatus,
        file_id: gallery.fileId,
      });
      if (response.type === 'success') {
        const updatedMovies = openMovieList.map((movie) =>
          movie.fileId === gallery.fileId
            ? { ...movie, isFavorite: newFavoriteStatus }
            : movie,
        );
        setOpenMovieList(updatedMovies);
      }
    } catch (error) {
      console.error('Failed to add to favorites:', error);
    }
  };

  const sendMovieRequest = async (user: rankedMeetPerson) => {
    const result = await requestVideo(user.user_id);
    if (result.success) {
      alert('動画リクエストを送信しました');
      trackEvent('COMPLETE_SEND_VIDEO_FILE_REQUEST');

      // 送信済みのユーザーはリクエストボタンを非表示にする
      setVideoRankingUsers(
        videoRankingUsers.map((video) =>
          video.user_id === user.user_id
            ? { ...video, isSendRequest: true }
            : video,
        ),
      );
    } else {
      console.error('video request:', result.error);
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

  const movieRankingItems = videoRankingUsers.map((user) => {
    const determineThumbnailClass = (rank: number) => {
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
          <div className={thumbnailClass}>
            {unOpenMovieList.some(
              (unOpenedMovie) => unOpenedMovie.userId === user.user_id,
            ) && (
              <div className={`${styles.videoRecievedRibbon} `}>
                <span>受取済み</span>
              </div>
            )}
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
            sendMovieRequest(user);
          }}
          className={styles.movieRequest}
          style={{
            display: user.isSendRequest ? 'none' : 'block',
          }}
        >
          動画リクエスト
        </div>
      </li>
    );
  });

  return (
    <>
      <div className={styles.all}>
        <div className={styles.label}>送信動画が人気のユーザー</div>
        <a href={'/gallery/ranking?type=movie'} onClick={stopPropagation}>
          <div className={styles.all}>すべて見る</div>
        </a>
      </div>
      <ul className={styles.unOpenlist}>{movieRankingItems}</ul>
      <div className={styles.all}>
        <div className={styles.label}>開封済みの動画</div>
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
          ? openMovieList
              .filter((movie) => movie.isFavorite)
              .map((gallery, index) => (
                <MovieItem
                  key={index}
                  gallery={gallery}
                  onMovieClick={() => {
                    setModalMovieOpen(true);
                    setSelectedMovie(gallery);
                  }}
                  onFavoriteClick={(e) => {
                    stopPropagation(e);
                    addToFavorites(gallery);
                  }}
                />
              ))
          : openMovieList.map((gallery, index) => (
              <MovieItem
                key={index}
                gallery={gallery}
                onMovieClick={() => {
                  setModalMovieOpen(true);
                  setSelectedMovie(gallery);
                }}
                onFavoriteClick={(e) => {
                  stopPropagation(e);
                  addToFavorites(gallery);
                }}
              />
            ))}
      </ul>
      {modalMovieOpen && selectedMovie && (
        <FullscreenVideoPlayer
          fileId={selectedMovie.fileId}
          onClose={() => {
            setModalMovieOpen(false);
            setSelectedMovie(null);
          }}
        />
      )}
      {notEnoughPointModalOpen && (
        <AppPayNoModal onClose={() => setNotEnoughPointModalOpen(false)} />
      )}
    </>
  );
};

export default PCMoviesGallery;
