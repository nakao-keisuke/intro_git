import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Swipe gesture constants
const MIN_SWIPE_DISTANCE = 10; // 最小スワイプ認識距離（px）

interface SwipeAnimationInput {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  delta?: number;
  animationDuration?: number;
}

interface SwipeAnimationOutput {
  ref: RefObject<HTMLDivElement | null>;
  transform: string;
  transition: string;
  isAnimating: boolean;
}

export const useSwipeAnimation = ({
  onSwipedLeft,
  onSwipedRight,
  delta = 50,
  animationDuration = 300,
}: SwipeAnimationInput): SwipeAnimationOutput => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX || 0);
    setIsDragging(true);
    setCurrentX(0);
  }, []);

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || touchStart === null) return;

      const currentTouch = e.targetTouches[0]?.clientX || 0;
      const diff = currentTouch - touchStart;

      // スワイプとして認識される最小移動距離をチェック
      const isSwipeGesture = Math.abs(diff) > MIN_SWIPE_DISTANCE;

      // スワイプジェスチャーとして認識された場合のみスクロールを防ぐ
      if (isSwipeGesture) {
        e.preventDefault();

        // スワイプの抵抗感を追加（端に近づくほど動きにくく）
        const resistance = 0.6;
        const adjustedDiff = diff * resistance;

        // スワイプの動きをより滑らかにする
        setCurrentX(adjustedDiff);
        setTouchEnd(currentTouch);
      }
    },
    [isDragging, touchStart],
  );

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || !isDragging) {
      setIsDragging(false);
      setCurrentX(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > delta;
    const isRightSwipe = distance < -delta;

    setIsDragging(false);
    setIsAnimating(true);

    if (isLeftSwipe && onSwipedLeft) {
      // 左スワイプ：画面を左にスライドアウト
      setCurrentX(-window.innerWidth);
      setTimeout(() => {
        onSwipedLeft();
        setCurrentX(0);
        setIsAnimating(false);
      }, animationDuration);
    } else if (isRightSwipe && onSwipedRight) {
      // 右スワイプ：画面を右にスライドアウト
      setCurrentX(window.innerWidth);
      setTimeout(() => {
        onSwipedRight();
        setCurrentX(0);
        setIsAnimating(false);
      }, animationDuration);
    } else {
      // スワイプが足りない場合は元の位置に戻る
      setCurrentX(0);
      setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [
    touchStart,
    touchEnd,
    isDragging,
    delta,
    onSwipedLeft,
    onSwipedRight,
    animationDuration,
  ]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // タッチイベントの設定を改善
    element.addEventListener('touchstart', onTouchStart, { passive: false });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  const transform = `translateX(${currentX}px)`;
  const transition = isDragging
    ? 'none'
    : `transform ${animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

  return {
    ref,
    transform,
    transition,
    isAnimating,
  };
};
