import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { ClipLoader } from 'react-spinners';

type PullToRefreshProps = {
  onRefresh?: () => Promise<unknown> | undefined;
  children: ReactNode;
  className?: string;
  threshold?: number;
  maxPullDistance?: number;
  loadingLabel?: string;
  onPullChange?: (state: { isPulling: boolean; pullDistance: number }) => void;
  /**
   * window スクロールを使用するかどうか
   * true: window.scrollY を監視（Virtuoso の useWindowScroll と併用時）
   * false: コンテナの scrollTop を監視（従来の動作）
   * @default false
   */
  useWindowScroll?: boolean;
};

const MIN_PULL_DISTANCE = 40;
const DIRECTION_THRESHOLD = 10;
const TOUCH_HISTORY_SIZE = 5;
const INDICATOR_HEIGHT = 50;
const MAX_CONTENT_TRANSLATE = 60;
const CONTENT_TRANSLATE_RATIO = 0.6;
const SNAP_BACK_BASE_DURATION = 250;

/**
 * Non-linear exponential resistance curve
 * Mimics native iOS/Android rubber-band pull effect:
 * - Small pulls: responsive (near 1:1)
 * - Large pulls: increasingly resistant (asymptotically approaches max)
 */
function applyResistance(rawDistance: number, maxDistance: number): number {
  if (rawDistance <= 0) return 0;
  return maxDistance * (1 - Math.exp((-rawDistance * 2) / maxDistance));
}

/** Cubic ease-out for smooth snap-back deceleration */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export const PullToRefresh = ({
  onRefresh,
  children,
  className,
  threshold = 80,
  maxPullDistance = 550,
  loadingLabel = '更新中...',
  onPullChange,
  useWindowScroll = false,
}: PullToRefreshProps) => {
  // DOM refs
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const indicatorContentRef = useRef<HTMLDivElement>(null);

  // Touch tracking refs (avoid re-renders during pull for 60fps)
  const pullDistanceRef = useRef(0);
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const startY = useRef(0);
  const startX = useRef(0);
  const scrollDirection = useRef<'undetermined' | 'vertical' | 'horizontal'>(
    'undetermined',
  );
  const canStartPull = useRef(false);

  // Animation refs
  const rafId = useRef(0);
  const snapAnimationId = useRef(0);

  // Touch velocity tracking for natural snap-back
  const touchHistory = useRef<Array<{ y: number; time: number }>>([]);

  const getScrollTop = useCallback(() => {
    if (useWindowScroll) return window.scrollY;
    return containerRef.current?.scrollTop ?? 0;
  }, [useWindowScroll]);

  // Direct DOM update — bypasses React render cycle for jank-free animation
  const applyStyles = useCallback((distance: number, pulling: boolean) => {
    const content = contentRef.current;
    const indicator = indicatorRef.current;
    const indicatorContent = indicatorContentRef.current;

    if (content) {
      if (distance > 0) {
        content.style.willChange = 'transform';
        const ty = Math.min(
          distance * CONTENT_TRANSLATE_RATIO,
          MAX_CONTENT_TRANSLATE,
        );
        content.style.transform = `translate3d(0,${ty}px,0)`;
      } else {
        content.style.transform = '';
        content.style.willChange = '';
      }
    }

    if (indicator) {
      const visible = distance > 0 || isRefreshingRef.current;
      // No CSS transition during pull/animation — JS handles timing
      indicator.style.height = visible ? `${INDICATOR_HEIGHT}px` : '0';
      indicator.style.opacity = visible ? '1' : '0';
    }

    if (indicatorContent) {
      indicatorContent.style.opacity = pulling
        ? String(Math.min(distance / 60, 1))
        : '1';
      indicatorContent.style.transition = pulling
        ? 'none'
        : 'opacity 0.3s ease-out';
    }
  }, []);

  // Schedule a single RAF per frame to batch touch updates
  const scheduleUpdate = useCallback(() => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      applyStyles(pullDistanceRef.current, isPullingRef.current);
      onPullChange?.({
        isPulling: isPullingRef.current,
        pullDistance: pullDistanceRef.current,
      });
    });
  }, [applyStyles, onPullChange]);

  // JS-based snap-back animation with velocity-aware duration
  const animateSnapBack = useCallback(
    (fromDistance: number, onComplete?: () => void) => {
      cancelAnimationFrame(snapAnimationId.current);

      // Calculate velocity from touch history for natural feel
      const history = touchHistory.current;
      let velocity = 0;
      if (history.length >= 2) {
        const last = history.at(-1);
        const prev = history.at(-2);
        if (!last || !prev) return;
        const dt = last.time - prev.time;
        if (dt > 0) velocity = Math.abs(last.y - prev.y) / dt;
      }

      // Faster snap when user releases with high velocity
      const duration =
        SNAP_BACK_BASE_DURATION * Math.max(0.4, 1 - velocity * 0.3);
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = fromDistance * (1 - eased);

        pullDistanceRef.current = current;
        applyStyles(current, false);

        if (progress < 1) {
          snapAnimationId.current = requestAnimationFrame(tick);
        } else {
          pullDistanceRef.current = 0;
          applyStyles(0, false);
          onComplete?.();
        }
      };

      snapAnimationId.current = requestAnimationFrame(tick);
    },
    [applyStyles],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      if (getScrollTop() === 0) {
        startY.current = touch.clientY;
        startX.current = touch.clientX;
        canStartPull.current = true;
        scrollDirection.current = 'undetermined';
        touchHistory.current = [{ y: touch.clientY, time: performance.now() }];
      } else {
        canStartPull.current = false;
      }
    },
    [getScrollTop],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshingRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      const currentY = touch.clientY;
      const currentX = touch.clientX;
      const deltaY = currentY - startY.current;
      const deltaX = currentX - startX.current;

      // Record for velocity calculation
      const now = performance.now();
      touchHistory.current.push({ y: currentY, time: now });
      if (touchHistory.current.length > TOUCH_HISTORY_SIZE) {
        touchHistory.current.shift();
      }

      // Direction detection (first significant movement decides)
      if (scrollDirection.current === 'undetermined' && canStartPull.current) {
        const absDX = Math.abs(deltaX);
        const absDY = Math.abs(deltaY);

        if (absDX > DIRECTION_THRESHOLD || absDY > DIRECTION_THRESHOLD) {
          if (absDX > absDY) {
            scrollDirection.current = 'horizontal';
            canStartPull.current = false;
            return;
          }
          scrollDirection.current = 'vertical';
          if (deltaY > 0) {
            isPullingRef.current = true;
          }
        }
        return;
      }

      if (scrollDirection.current === 'horizontal') return;
      if (!isPullingRef.current) return;

      if (deltaY <= 0) {
        pullDistanceRef.current = 0;
        isPullingRef.current = false;
        scheduleUpdate();
        return;
      }

      if (deltaY < MIN_PULL_DISTANCE) {
        pullDistanceRef.current = 0;
        scheduleUpdate();
        return;
      }

      const effective = deltaY - MIN_PULL_DISTANCE;
      // Non-linear resistance (rubber band effect like native)
      pullDistanceRef.current = applyResistance(effective, maxPullDistance);
      scheduleUpdate();
    },
    [maxPullDistance, scheduleUpdate],
  );

  const handleTouchEnd = useCallback(
    async (e: React.TouchEvent) => {
      // Multi-touch: don't trigger until all fingers are lifted
      if (e.touches.length > 0) return;

      scrollDirection.current = 'undetermined';
      canStartPull.current = false;

      if (!isPullingRef.current) {
        pullDistanceRef.current = 0;
        onPullChange?.({ isPulling: false, pullDistance: 0 });
        return;
      }

      isPullingRef.current = false;
      const currentPull = pullDistanceRef.current;
      const effectiveThreshold = Math.min(threshold, maxPullDistance);

      if (currentPull >= effectiveThreshold && !isRefreshingRef.current) {
        // Threshold reached → trigger refresh

        isRefreshingRef.current = true;

        // Snap back content but keep indicator visible during refresh
        animateSnapBack(currentPull);

        try {
          if (onRefresh) await onRefresh();
        } catch (error) {
          if (import.meta.env.NODE_ENV !== 'production') {
            console.error('PullToRefresh: Refresh failed:', error);
          }
        } finally {
          isRefreshingRef.current = false;
          // Smoothly close indicator after refresh completes
          if (indicatorRef.current) {
            indicatorRef.current.style.transition =
              'height 0.3s ease-out, opacity 0.3s ease-out';
            indicatorRef.current.style.height = '0';
            indicatorRef.current.style.opacity = '0';
            // Reset transition after animation so it doesn't interfere with next pull
            setTimeout(() => {
              if (indicatorRef.current) {
                indicatorRef.current.style.transition = 'none';
              }
            }, 300);
          }
        }
      } else {
        // Below threshold → snap back to 0
        animateSnapBack(currentPull);
      }

      onPullChange?.({ isPulling: false, pullDistance: 0 });
    },
    [threshold, maxPullDistance, onRefresh, onPullChange, animateSnapBack],
  );

  const handleTouchCancel = useCallback(() => {
    isPullingRef.current = false;
    pullDistanceRef.current = 0;
    scrollDirection.current = 'undetermined';
    canStartPull.current = false;
    cancelAnimationFrame(rafId.current);
    rafId.current = 0;
    applyStyles(0, false);
    onPullChange?.({ isPulling: false, pullDistance: 0 });
  }, [onPullChange, applyStyles]);

  // Cleanup animation frames on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafId.current);
      cancelAnimationFrame(snapAnimationId.current);
    };
  }, []);

  // useWindowScroll の場合は overflow-auto を適用しない（window スクロールと競合するため）
  const containerClassName = useWindowScroll
    ? `h-full ${className ?? ''}`
    : `h-full overflow-auto ${className ?? ''}`;

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* Pull indicator — DOM-manipulated for 60fps, no React re-renders */}
      <div
        ref={indicatorRef}
        className="flex items-center justify-center overflow-hidden"
        style={{ height: 0, opacity: 0, transition: 'none' }}
      >
        <div
          ref={indicatorContentRef}
          className="flex items-center gap-2 text-gray-500"
          style={{ opacity: 0 }}
        >
          <ClipLoader color="#8E8E93" size={20} speedMultiplier={0.7} />
          <span className="text-sm">{loadingLabel}</span>
        </div>
      </div>

      {/* Content — transform applied via ref for GPU-accelerated animation */}
      <div ref={contentRef}>{children}</div>
    </div>
  );
};
