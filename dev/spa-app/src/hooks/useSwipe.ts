import { useEffect, useRef, useState } from 'react';

interface SwipeInput {
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  delta?: number;
}

interface SwipeOutput {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
}

export const useSwipe = ({
  onSwipedLeft,
  onSwipedRight,
  delta = 50,
}: SwipeInput): SwipeOutput => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX || 0);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX || 0);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > delta;
    const isRightSwipe = distance < -delta;

    if (isLeftSwipe && onSwipedLeft) {
      onSwipedLeft();
    }

    if (isRightSwipe && onSwipedRight) {
      onSwipedRight();
    }

    // Reset
    setTouchStart(null);
    setTouchEnd(null);
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

// React コンポーネント用のフック
export const useSwipeHandler = (input: SwipeInput) => {
  const swipeHandlers = useSwipe(input);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', swipeHandlers.onTouchStart, {
      passive: true,
    });
    element.addEventListener('touchmove', swipeHandlers.onTouchMove, {
      passive: true,
    });
    element.addEventListener('touchend', swipeHandlers.onTouchEnd, {
      passive: true,
    });

    return () => {
      element.removeEventListener('touchstart', swipeHandlers.onTouchStart);
      element.removeEventListener('touchmove', swipeHandlers.onTouchMove);
      element.removeEventListener('touchend', swipeHandlers.onTouchEnd);
    };
  }, [swipeHandlers]);

  return ref;
};
