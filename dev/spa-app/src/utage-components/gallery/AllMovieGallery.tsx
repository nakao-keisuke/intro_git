import {
  IconHeart,
  IconPlayerPlay,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useCallback, useEffect, useRef, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import AppPayNoModal from '@/app/components/AppPayNoModal';
import FullscreenVideoPlayer from '@/components/gallery/FullscreenVideoPlayer';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import { GET_UNOPEN_ITEMS, PURCHASE_VIDEO } from '@/constants/endpoints';
import type { galleryListUserInfo } from '@/hooks/useGalleryData.hook';
import styles from '@/styles/Gallery.module.css';
import type { ResponseData } from '@/types/NextApi';
import { trackEvent } from '@/utils/eventTracker';
import { imageUrl } from '@/utils/image';
import { postToNext } from '@/utils/next';

type UnopenedItem = {
  user: {
    userId: string;
    userName: string;
    avaId: string;
    age: number;
    abt?: string;
  };
  unopenedContent: {
    fileId: string;
    views?: number;
    favorites?: number;
    sentDate?: string;
    duration?: number;
  };
};

type MoviesGalleryProps = {
  openMovies: galleryListUserInfo[];
  unOpenMovies: galleryListUserInfo[];
  onFullscreenChange?: (isOpen: boolean, movie?: galleryListUserInfo) => void;
};

const AllMoviesGallery: React.FC<MoviesGalleryProps> = ({
  openMovies,
  unOpenMovies,
  onFullscreenChange,
}) => {
  const [_modalMovieOpen, _setModalMovieOpen] = useState(false);
  const [fullscreenMovieOpen, setFullscreenMovieOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] =
    useState<galleryListUserInfo | null>(null);
  const [unOpenMovieList, setUnOpenMovieList] = useState(unOpenMovies);
  const [_openMovieList, setOpenMovieList] = useState(openMovies);
  const [isLoading, setIsLoading] = useState(false);
  const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] = useState(false);
  const markerRef = useRef<HTMLLIElement | null>(null);
  const [pagination, setPagination] = useState(0);

  const fetchMoreMovies = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const skip = 50;

      const response = await postToNext<
        ResponseData<{
          items: UnopenedItem[];
        }>
      >(GET_UNOPEN_ITEMS, {
        isImage: false,
        skip: skip + pagination * 50,
        take: 50,
      });

      if (response.type === 'error') {
        console.error('Error fetching more movies:', response.message);
        return;
      }

      if (!response.items || response.items.length === 0) {
        return;
      }

      const newMovies: galleryListUserInfo[] = response.items.map((item) => ({
        userId: item.user.userId,
        fileId: item.unopenedContent.fileId,
        isFavorite: false,
        userName: item.user.userName,
        avaId: item.user.avaId,
        age: item.user.age,
        ...(item.unopenedContent.views !== undefined && {
          views: item.unopenedContent.views,
        }),
        ...(item.unopenedContent.favorites !== undefined && {
          favorites: item.unopenedContent.favorites,
        }),
        ...(item.unopenedContent.sentDate !== undefined && {
          sentDate: item.unopenedContent.sentDate,
        }),
        ...(item.unopenedContent.duration !== undefined && {
          duration: item.unopenedContent.duration,
        }),
        ...(item.user.abt !== undefined && { abt: item.user.abt }),
      }));

      setUnOpenMovieList((prev) => [...prev, ...newMovies]);
      setPagination((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching more movies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, isLoading]);

  useEffect(() => {
    // 親要素のスクロールコンテナを取得
    const scrollContainer = markerRef.current?.closest(`.${styles.tabContent}`);

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isLoading) {
          fetchMoreMovies();
        }
      },
      {
        root: scrollContainer || null,
        rootMargin: '100px',
        threshold: 0.1,
      },
    );

    const currentMarker = markerRef.current;
    if (currentMarker) {
      observer.observe(currentMarker);
    }

    return () => {
      if (currentMarker) {
        observer.disconnect();
      }
    };
  }, [fetchMoreMovies, isLoading]);

  const purchaseVideo = async (gallery: galleryListUserInfo) => {
    setIsLoading(true);
    const response = await postToNext<{}>(PURCHASE_VIDEO, {
      fileId: gallery.fileId,
    });
    if (response.type === 'error') {
      if (response.notEnoughPoint) {
        setNotEnoughPointModalOpen(true);
      }
      setIsLoading(false);
      return;
    }
    trackEvent('COMPLETE_BUY_VIDEO', { from: window.location.pathname });
    localStorage.setItem('purchaseGalleryItem', 'true');

    setUnOpenMovieList((prev) =>
      prev.filter((item) => item.fileId !== gallery.fileId),
    );
    const newMovie: galleryListUserInfo = {
      fileId: gallery.fileId,
      userId: gallery.userId,
      userName: gallery.userName,
      avaId: gallery.avaId,
      age: gallery.age,
      isFavorite: false,
      duration: gallery.duration || 0,
      views: gallery.views || 0,
      favorites: gallery.favorites || 0,
      sentDate: gallery.sentDate || '',
      abt: gallery.abt || '',
    };
    setOpenMovieList((prev) => {
      const updatedList = [...prev];
      updatedList.unshift(newMovie);
      return updatedList;
    });
    setIsLoading(false);
    setSelectedMovie(newMovie);
    setFullscreenMovieOpen(true);

    // Call onFullscreenChange if provided
    if (onFullscreenChange) {
      onFullscreenChange(true, newMovie);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const formatUserName = (userName: string) => {
    return userName.length > 4
      ? `${[...userName].slice(0, 4).join('')}...`
      : userName;
  };

  // const sentDate = (sentDateStr: string) => {
  //   if (sentDateStr.length < 12) {
  //     console.error('Invalid sentDate format:', sentDateStr);
  //     return '不明な日付';
  //   }

  //   const year = parseInt(sentDateStr.substring(0, 4), 10);
  //   const month = parseInt(sentDateStr.substring(4, 6), 10) - 1; // 月は0ベース
  //   const day = parseInt(sentDateStr.substring(6, 8), 10);
  //   const hour = parseInt(sentDateStr.substring(8, 10), 10);
  //   const minute = parseInt(sentDateStr.substring(10, 12), 10);
  //   // 秒が必要なら以下を追加
  //   // const second = parseInt(sentDateStr.substring(12, 14), 10);

  //   const postDate = new Date(year, month, day, hour, minute);
  //   const now = new Date();
  //   const diffTime = now.getTime() - postDate.getTime();

  //   const diffMinutes = Math.floor(diffTime / (1000 * 60));
  //   const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  //   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  //   // 同じ日かどうかをチェック
  //   if (
  //     now.getFullYear() === postDate.getFullYear() &&
  //     now.getMonth() === postDate.getMonth() &&
  //     now.getDate() === postDate.getDate()
  //   ) {
  //     if (diffHours < 1) {
  //       return `${diffMinutes}分前`;
  //     } else {
  //       return `${diffHours}時間前`;
  //     }
  //   } else {
  //     return `${diffDays}日前`;
  //   }
  // };

  return (
    <div>
      {/* 未開封動画のリスト */}
      <ul className={styles.list}>
        {unOpenMovieList.map((gallery) => (
          <li key={`${gallery.fileId}_${gallery.userId}_${gallery.sentDate}`}>
            <div
              className={styles.wrapper}
              onClick={() => purchaseVideo(gallery)}
            >
              <div className={styles.images}>
                <Image
                  src={imageUrl(gallery.fileId)}
                  fill
                  // sizes="(max-width: 768px) 50vw,
                  //        (max-width: 1200px) 33vw,
                  //        25vw"
                  style={{
                    objectFit: 'cover',
                    borderRadius: '8px',
                    width: '100%',
                    height: '100%',
                  }}
                  alt={`${gallery.userName}の動画`}
                />
              </div>

              <div className={styles.views}>
                <div>
                  <IconPlayerPlay size={20} />
                  <span> {gallery.views}</span>
                </div>
                <div>
                  <IconHeart size={20} />
                  <span> {gallery.favorites}</span>
                </div>
              </div>

              <div
                className={styles.overdummy}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMovie(gallery);
                  setFullscreenMovieOpen(true);
                  if (onFullscreenChange) {
                    onFullscreenChange(true, gallery);
                  }
                }}
              >
                <div className={styles.lock}>
                  <IconPlayerPlayFilled size={25} />
                </div>
              </div>

              <div className={styles.abt}>{gallery.abt}</div>

              <div className={styles.nameWrapper}>
                <a
                  href={`/profile/unbroadcaster/${gallery.userId}`}
                  onClick={stopPropagation}
                  style={{
                    display: 'flex',
                    width: '100%',
                    textDecoration: 'none',
                  }}
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
                  <div className={styles.timeWrapper}>
                    <div className={styles.time}>00:{gallery.duration}</div>
                    <div className={styles.name}>
                      {formatUserName(gallery.userName)} / {gallery.age}歳
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <center>
        <span ref={markerRef} />
        {isLoading && (
          <div style={{ padding: '20px' }}>
            <ClipLoader color="#999999" size={40} />
          </div>
        )}
      </center>
      {fullscreenMovieOpen && selectedMovie && (
        <FullscreenVideoPlayer
          fileId={selectedMovie.fileId}
          onClose={() => {
            setFullscreenMovieOpen(false);
            setSelectedMovie(null);

            // Call onFullscreenChange if provided
            if (onFullscreenChange) {
              onFullscreenChange(false);
            }
          }}
        />
      )}
      {notEnoughPointModalOpen && (
        <AppPayNoModal onClose={() => setNotEnoughPointModalOpen(false)} />
      )}
    </div>
  );
};

export default AllMoviesGallery;
