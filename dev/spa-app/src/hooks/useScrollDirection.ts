import { useEffect, useRef, useState } from 'react';

export type ScrollDirection = 'up' | 'down';

// Body/Window のスクロール操作（マウスホイール + タッチ）を監視してスクロール方向を返すカスタムフック
const MIN_DIRECTION_DELTA_PX = 15; // より大きな値にして敏感さを下げる
const EDGE_GUARD_PX = 12;
const DIRECTION_CHANGE_DEBOUNCE_MS = 150; // 方向変更のデバウンス時間

/**
 * グローバルスクロール方向を判定し、ヘッダー表示制御などで利用するカスタムフック。
 * 端でのゴム跳ねや微小な揺れは無視して安定した方向を返す。
 */
export const useScrollDirection = (
  initialDirection: ScrollDirection = 'up',
) => {
  // localStorageから前回のスクロール方向と位置を復元
  const getStoredDirection = (): ScrollDirection => {
    if (typeof window === 'undefined') return initialDirection;
    try {
      const stored = localStorage.getItem('scrollDirection');
      const result =
        stored === 'up' || stored === 'down' ? stored : initialDirection;
      return result;
    } catch {
      return initialDirection;
    }
  };

  const getStoredScrollPosition = (): number => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = localStorage.getItem('scrollPosition');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  };

  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(
    () => {
      const stored = getStoredDirection();
      // ページ遷移時はスクロール位置を確認してトップ付近の場合は 'up' を強制
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY || window.pageYOffset || 0;
        if (currentScrollY <= 50) {
          // トップ50px以内は強制的に 'up'
          return 'up';
        }
      }
      return stored;
    },
  );
  const directionRef = useRef<ScrollDirection>(getStoredDirection());
  const scrollYRef = useRef(0);
  const lastDirectionChangeTime = useRef(0);
  const isTouchActive = useRef(false);

  // ページ遷移時のスクロール位置チェック
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkScrollPosition = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      if (currentScrollY <= 50 && directionRef.current !== 'up') {
        directionRef.current = 'up';
        setScrollDirection('up');
        scrollYRef.current = currentScrollY;
      }
    };

    // ページ遷移からの復元かどうかを判定
    const isPageNavigation =
      sessionStorage.getItem('pageNavigation') === 'true';
    sessionStorage.removeItem('pageNavigation'); // 使用後は削除

    if (isPageNavigation) {
      // ページ遷移からの復元の場合のみ位置を復元
      const storedPosition = getStoredScrollPosition();
      const currentScrollY = window.scrollY || window.pageYOffset || 0;

      if (storedPosition > 50 && currentScrollY <= 50) {
        setTimeout(() => {
          window.scrollTo(0, storedPosition);
        }, 100);
      }
    } else {
      // リロードや初回アクセス時は通常のチェック
      checkScrollPosition();
    }

    // ページ遷移時にsessionStorageにフラグをセット
    const handleBeforeUnload = () => {
      try {
        sessionStorage.setItem('pageNavigation', 'true');
      } catch {
        // sessionStorageが利用できない場合は無視
      }
    };

    // スクロールイベントで定期的にチェック
    const handleScrollCheck = () => checkScrollPosition();
    window.addEventListener('scroll', handleScrollCheck, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScrollCheck);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const bodyElement = document.body;
    if (!bodyElement) return undefined;

    /**
     * 現在のスクロール位置と、スクロール可能な最大値を取得する。
     */
    const getScrollState = () => {
      const scrollingElement =
        document.scrollingElement ?? document.documentElement;
      const currentY =
        window.scrollY ?? window.pageYOffset ?? scrollingElement.scrollTop ?? 0;
      const maxY = Math.max(
        0,
        scrollingElement.scrollHeight - window.innerHeight,
      );
      return { currentY, maxY };
    };

    scrollYRef.current = getScrollState().currentY;

    /**
     * 判定結果を更新し、同じ方向への連続更新は避ける。
     * デバウンス処理を追加して頻繁な方向変更を防ぐ。
     */
    const updateDirection = (nextDirection: ScrollDirection) => {
      if (directionRef.current === nextDirection) return;

      const now = Date.now();
      if (
        now - lastDirectionChangeTime.current <
        DIRECTION_CHANGE_DEBOUNCE_MS
      ) {
        return; // デバウンス期間中は変更を無視
      }

      directionRef.current = nextDirection;
      lastDirectionChangeTime.current = now;
      setScrollDirection(nextDirection);

      // localStorageに保存してページ遷移後も維持
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('scrollDirection', nextDirection);
          localStorage.setItem('scrollPosition', scrollYRef.current.toString());
        } catch {
          // localStorageが利用できない場合は無視
        }
      }
    };

    /**
     * トップエッジでのスクロール処理を統一するヘルパー関数
     */
    const handleTopEdgeScroll = (currentY: number) => {
      if (currentY <= EDGE_GUARD_PX) {
        updateDirection('up');
        scrollYRef.current = currentY;
        return true;
      }
      return false;
    };

    /**
     * ホイール操作時の方向を判定。端に張り付いた状態での逆方向操作は無視する。
     */
    const onWheel = (event: WheelEvent) => {
      // タッチスクロールがアクティブな場合はwheelイベントを無視
      if (isTouchActive.current) return;

      const { deltaY } = event;
      if (deltaY === 0) return;

      const { currentY, maxY } = getScrollState();
      const isAtTop = currentY <= EDGE_GUARD_PX;
      const isAtBottom = currentY >= maxY - EDGE_GUARD_PX;

      // トップエッジでの上方向スクロールを統一処理
      if (isAtTop && deltaY < 0) {
        handleTopEdgeScroll(currentY);
        return;
      }

      if (isAtBottom && deltaY > 0) {
        return;
      }

      updateDirection(deltaY < 0 ? 'up' : 'down');
      scrollYRef.current = currentY;
    };

    /**
     * スクロール位置の変化量から方向を判定。ゴム跳ねや微小揺れは検知対象外にする。
     */
    const onScroll = () => {
      const { currentY, maxY } = getScrollState();
      const previousY = scrollYRef.current;
      if (currentY === previousY) return;

      // トップエッジでの処理を統一
      if (handleTopEdgeScroll(currentY)) {
        return;
      }

      const diff = currentY - previousY;

      if (Math.abs(diff) < MIN_DIRECTION_DELTA_PX) {
        scrollYRef.current = currentY;
        return;
      }

      const isNearTop = currentY <= EDGE_GUARD_PX;
      const wasNearTop = previousY <= EDGE_GUARD_PX;
      const isNearBottom = currentY >= maxY - EDGE_GUARD_PX;
      const wasNearBottom = previousY >= maxY - EDGE_GUARD_PX;

      if ((wasNearTop && diff < 0) || (wasNearBottom && diff > 0)) {
        scrollYRef.current = currentY;
        return;
      }

      if (
        directionRef.current === 'down' &&
        wasNearBottom &&
        isNearBottom &&
        diff < 0
      ) {
        scrollYRef.current = currentY;
        return;
      }

      if (
        directionRef.current === 'up' &&
        wasNearTop &&
        isNearTop &&
        diff > 0
      ) {
        scrollYRef.current = currentY;
        return;
      }

      updateDirection(diff < 0 ? 'up' : 'down');
      scrollYRef.current = currentY;
    };

    /**
     * タッチスクロール時の方向を判定（モバイル対応）
     */
    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      isTouchActive.current = true;
      touchStartY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = () => {
      // タッチ終了時にリセット
      touchStartY = 0;
      isTouchActive.current = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartY === 0) return;

      const touchCurrentY = event.touches[0]?.clientY ?? 0;
      const diff = touchStartY - touchCurrentY;

      if (Math.abs(diff) < MIN_DIRECTION_DELTA_PX) return;

      const { currentY, maxY } = getScrollState();
      const isAtTop = currentY <= EDGE_GUARD_PX;
      const isAtBottom = currentY >= maxY - EDGE_GUARD_PX;

      // トップエッジでの処理
      if (isAtTop && diff < 0) {
        handleTopEdgeScroll(currentY);
        return;
      }

      if (isAtBottom && diff > 0) {
        return;
      }

      updateDirection(diff > 0 ? 'down' : 'up');
      touchStartY = touchCurrentY;
    };

    bodyElement.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      bodyElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return scrollDirection;
};
