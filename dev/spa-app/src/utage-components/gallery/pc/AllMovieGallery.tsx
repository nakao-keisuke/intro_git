import { IconHeart, IconPlayerPlay } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useCallback, useEffect, useRef, useState } from 'react';
import AppPayNoModal from '@/app/components/AppPayNoModal';
import FullscreenVideoPlayer from '@/components/gallery/FullscreenVideoPlayer';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import { GET_UNOPEN_ITEMS, PURCHASE_VIDEO } from '@/constants/endpoints';
import type { galleryListUserInfo } from '@/features/gallery/index.hook';
import styles from '@/styles/PCGallery.module.css';
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
};

const PCAllMoviesGallery: React.FC<MoviesGalleryProps> = ({
  openMovies,
  unOpenMovies,
}) => {
  const [modalMovieOpen, setModalMovieOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] =
    useState<galleryListUserInfo | null>(null);
  const [_selectedUnopenedMovie, setSelectedUnopenedMovie] =
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
        avatarId: item.user.avaId,
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
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isLoading) {
          fetchMoreMovies();
        }
      },
      {
        root: null,
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
    trackEvent('COMPLETE_BUY_VIDEO');
    localStorage.setItem('purchaseGalleryItem', 'true');

    setUnOpenMovieList((prev) =>
      prev.filter((item) => item.fileId !== gallery.fileId),
    );
    const newMovie: galleryListUserInfo = {
      fileId: gallery.fileId,
      userId: gallery.userId,
      userName: gallery.userName,
      avatarId: gallery.avatarId,
      age: gallery.age,
      isFavorite: false,
      duration: gallery.duration || 0,
    };
    setOpenMovieList((prev) => {
      const updatedList = [...prev];
      updatedList.unshift(newMovie);
      return updatedList;
    });
    setIsLoading(false);
    setSelectedMovie(newMovie);
    setModalMovieOpen(true);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const formatUserName = (userName: string) => {
    return userName.length > 4
      ? `${[...userName].slice(0, 4).join('')}...`
      : userName;
  };

  return (
    <div>
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

              <div className={styles.overdummy}>
                <div className={styles.lock}>
                  <Image
                    className={styles.key}
                    src="/chat/movie.webp"
                    width={40}
                    height={40}
                    alt="movie"
                  />
                </div>
              </div>

              <div className={styles.abt}>{gallery.abt}</div>

              <div className={styles.nameWrapper}>
                <a
                  href={`/profile/unbroadcaster/pc/${gallery.userId}`}
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
                        avatarId={gallery.avatarId}
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

              {isLoading && <div className={styles.loader} />}
            </div>
          </li>
        ))}
      </ul>
      <center>
        <span ref={markerRef} />
      </center>
      {modalMovieOpen && selectedMovie && (
        <FullscreenVideoPlayer
          fileId={selectedMovie.fileId}
          onClose={() => {
            setModalMovieOpen(false);
            setSelectedMovie(null);
            setSelectedUnopenedMovie(null);
          }}
        />
      )}
      {notEnoughPointModalOpen && (
        <AppPayNoModal onClose={() => setNotEnoughPointModalOpen(false)} />
      )}
    </div>
  );
};

export default PCAllMoviesGallery;
