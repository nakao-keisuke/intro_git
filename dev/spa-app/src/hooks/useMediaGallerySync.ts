import { useEffect, useRef } from 'react';
import type { Swiper as SwiperClass } from 'swiper';
import { useProfileStore } from '@/stores/profileStore';

/**
 * ProfileImageGallery用：Sliderとの同期
 * Zustandのstateとreact-slickのSliderを双方向で同期
 */
export function useImageGallerySync() {
  const currentImageIndex = useProfileStore((s) => s.mediaGalleryImageIndex);
  const setCurrentImageIndex = useProfileStore(
    (s) => s.setMediaGalleryImageIndex,
  );
  const swiperRef = useRef<SwiperClass | null>(null);
  // 直近の「内部発火による更新」のインデックスを保持
  // Recoilの変更がこの値と同じであれば、スライド移動はスキップ
  const lastInternalIndexRef = useRef<number | null>(null);

  // Recoil state変更 → Sliderを動かす
  useEffect(() => {
    const instance = swiperRef.current as
      | (SwiperClass & {
          slideToLoop?: (index: number, speed?: number) => void;
          params?: any;
          realIndex?: number;
          activeIndex?: number;
        })
      | null;

    // 直近の内部更新と同じインデックスならスキップ
    if (lastInternalIndexRef.current === currentImageIndex) {
      lastInternalIndexRef.current = null;
      return;
    }

    if (instance) {
      const current =
        typeof instance.realIndex === 'number'
          ? instance.realIndex!
          : (instance.activeIndex ?? 0);
      // 既に同じインデックスであれば移動しない（不要なonSlideChange発火の抑止）
      if (current === currentImageIndex) return;

      const isLoop = !!instance.params?.loop;
      if (isLoop && typeof instance.slideToLoop === 'function') {
        instance.slideToLoop(currentImageIndex, 200);
      } else if (typeof instance.slideTo === 'function') {
        // speed に合わせて 200ms で統一
        instance.slideTo(currentImageIndex, 200);
      }
    }
  }, [currentImageIndex]);

  // Slider変更 → Recoil stateを更新
  const handleSlideChange = (index: number) => {
    // 内部発火であることを記録（この直後にRecoilの変更が走る）
    lastInternalIndexRef.current = index;

    // 値が変わらない場合は更新しない
    if (currentImageIndex !== index) {
      setCurrentImageIndex(index);
    }
  };

  return {
    swiperRef,
    currentImageIndex,
    handleSlideChange,
  };
}

/**
 * ProfileThumbnailGallery用：サムネイルクリック処理
 * Zustandのstateを更新することで、ProfileImageGalleryのスライダーが自動的に移動
 */
export function useThumbnailGallerySync() {
  const currentImageIndex = useProfileStore((s) => s.mediaGalleryImageIndex);
  const setCurrentImageIndex = useProfileStore(
    (s) => s.setMediaGalleryImageIndex,
  );

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return {
    currentImageIndex,
    handleThumbnailClick,
  };
}
