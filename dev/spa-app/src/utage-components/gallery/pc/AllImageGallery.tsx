import { IconHeart, IconMailOpened } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useCallback, useEffect, useRef, useState } from 'react';
import AppPayNoModal from '@/app/components/AppPayNoModal';
import ImageModal from '@/components/chat/chatcontent/ImageModal';
import RoundedThumbnail from '@/components/RoundedThumbnail';
import { GET_UNOPEN_ITEMS, PURCHASE_IMAGE } from '@/constants/endpoints';
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

type ImageGalleryProps = {
  openImages: galleryListUserInfo[];
  unOpenImages: galleryListUserInfo[];
};

const PCAllImageGallery: React.FC<ImageGalleryProps> = ({
  openImages,
  unOpenImages,
}) => {
  const [modalImageOpen, setModalImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] =
    useState<galleryListUserInfo | null>(null);
  const [_selectedUnopenedImage, _setSelectedUnopenedImage] =
    useState<galleryListUserInfo | null>(null);
  const [unOpenImageList, setUnOpenImageList] = useState(unOpenImages);
  const [_openImageList, setOpenImageList] = useState(openImages);
  const [isLoading, setIsLoading] = useState(false);
  const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] = useState(false);
  const markerRef = useRef<HTMLLIElement | null>(null);
  const [pagination, setPagination] = useState(0);

  const fetchMoreImages = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const skip = 50;

      const response = await postToNext<
        ResponseData<{
          items: UnopenedItem[];
        }>
      >(GET_UNOPEN_ITEMS, {
        isImage: true,
        skip: skip + pagination * 50,
        take: 50,
      });

      if (response.type === 'error') {
        console.error('Error fetching more images:', response.message);
        return;
      }

      if (!response.items || response.items.length === 0) {
        return;
      }

      const newImages: galleryListUserInfo[] = response.items.map((item) => ({
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

      setUnOpenImageList((prev) => [...prev, ...newImages]);
      setPagination((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching more images:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !isLoading) {
          fetchMoreImages();
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
  }, [fetchMoreImages, isLoading]);

  const purchaseImage = async (gallery: galleryListUserInfo) => {
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
    trackEvent('COMPLETE_BUY_IMAGE');
    localStorage.setItem('purchaseGalleryItem', 'true');

    setUnOpenImageList((prev) =>
      prev.filter((item) => item.fileId !== gallery.fileId),
    );
    const newImage: galleryListUserInfo = {
      fileId: gallery.fileId,
      userId: gallery.userId,
      userName: gallery.userName,
      avatarId: gallery.avatarId,
      age: gallery.age,
      isFavorite: false,
    };
    setOpenImageList((prev) => {
      const updatedList = [...prev];
      updatedList.unshift(newImage);
      return updatedList;
    });
    setIsLoading(false);
    setSelectedImage(newImage);
    setModalImageOpen(true);
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
        {unOpenImageList.map((gallery) => (
          <li key={`${gallery.fileId}_${gallery.userId}_${gallery.sentDate}`}>
            <div
              className={styles.wrapper}
              onClick={() => purchaseImage(gallery)}
            >
              <div className={styles.overdummy}>
                <Image
                  className={styles.tap}
                  src="/hand.webp"
                  width={40}
                  height={40}
                  alt="movie"
                />
              </div>
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
              <div className={styles.views}>
                <div>
                  <IconMailOpened size={20} />
                  <span> {gallery.views}</span>
                </div>
                <div>
                  <IconHeart size={20} />
                  <span> {gallery.favorites}</span>
                </div>
              </div>
              <div className={styles.abt}>{gallery.abt}</div>
              <div className={styles.overlay}></div>
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
    </div>
  );
};

export default PCAllImageGallery;
