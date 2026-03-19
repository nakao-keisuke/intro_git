// Image component removed (use <img> directly);
import { memo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { FleaMarketItemWithFavoritesCamel } from '@/services/fleamarket/type';
import FleaMarketItemList from './FleaMarketItemList';

type Props = {
  items: FleaMarketItemWithFavoritesCamel[];
  onClose: () => void;
  isPCView: boolean;
  onViewItem?: ((itemId: string) => void) | undefined;
  onPurchase?: ((item: FleaMarketItemWithFavoritesCamel) => void) | undefined;
  userName: string;
};

const FleaMarketModal = memo<Props>(
  ({ items, onClose, isPCView, onViewItem, onPurchase, userName }) => {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const touchStartYRef = useRef<number | null>(null);
    const lastTouchYRef = useRef<number | null>(null);
    const mountedAtRef = useRef<number>(Date.now());

    useEffect(() => {
      mountedAtRef.current = Date.now();
    }, [isPCView, items]);

    // モーダルが開いている間、背景のスクロールを防止
    useEffect(() => {
      if (isPCView) return;

      const originalStyle = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalWidth = document.body.style.width;
      const originalTop = document.body.style.top;
      const scrollY = window.scrollY;

      // bodyを固定してスクロールを防止
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;

      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.position = originalPosition;
        document.body.style.width = originalWidth;
        document.body.style.top = originalTop;
        window.scrollTo(0, scrollY);
      };
    }, [isPCView]);

    const handleTouchStart = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        const touch = event.touches[0];
        if (!touch) return;
        touchStartYRef.current = touch.clientY;
        lastTouchYRef.current = touch.clientY;
      },
      [],
    );

    const handleTouchMove = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        const touch = event.touches[0];
        if (!touch) return;
        lastTouchYRef.current = touch.clientY;

        const scrollTop = modalRef.current?.scrollTop ?? 0;
        const startY = touchStartYRef.current ?? 0;
        const deltaY = touch.clientY - startY;

        // モーダルがスクロール上端にあり、下方向にスワイプしている場合はデフォルト動作を防止
        if (scrollTop <= 0 && deltaY > 0) {
          event.preventDefault();
        }
      },
      [],
    );

    const handleTouchEnd = useCallback(() => {
      const startY = touchStartYRef.current;
      const endY = lastTouchYRef.current;
      touchStartYRef.current = null;
      lastTouchYRef.current = null;
      if (startY == null || endY == null) return;

      const deltaY = endY - startY;
      const scrollTop = modalRef.current?.scrollTop ?? 0;
      // 下方向へ十分にスワイプ、かつ内容が先頭（スクロール上端）のときのみ閉じる
      if (deltaY > 80 && scrollTop <= 0) {
        onClose();
      }
    }, [onClose]);

    // オーバーレイのタッチイベントでプルダウンを防止
    const handleOverlayTouchMove = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        event.preventDefault();
      },
      [],
    );

    // PC版ではbackdropなしで中身だけをレンダリング
    if (isPCView) {
      return (
        <>
          <div className="mb-4 flex items-center justify-center gap-2 rounded-[30px] bg-[rgba(103,103,103,0.33)] px-3 py-1">
            <Image
              src="/bottom_navigation.icon/bottom_fleamarket.webp"
              alt="フリマ"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="whitespace-nowrap font-bold text-[13px] text-white">
              配信者のフリマ商品
            </span>
          </div>
          <FleaMarketItemList
            items={items}
            onViewItem={onViewItem}
            onPurchase={onPurchase}
          />
        </>
      );
    }

    // モバイル版はポータルで body に描画し、stacking context の影響を回避
    if (typeof window === 'undefined') return null;

    return createPortal(
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[10003] flex cursor-pointer touch-none flex-col items-center justify-end bg-[rgba(217,217,217,0.1)]"
        onClick={(event) => {
          const now = Date.now();
          if (now - mountedAtRef.current < 200) {
            // マウント直後の同一タップでの誤閉じを防止
            event.stopPropagation();
            return;
          }
          event.stopPropagation();
          onClose();
        }}
        onTouchMove={handleOverlayTouchMove}
      >
        <div
          ref={modalRef}
          className="relative z-[10001] max-h-[70vh] w-full animate-flea-market-popup cursor-default touch-pan-y overflow-y-auto rounded-t-[15px] bg-white p-5 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-4 md:mb-5 md:max-w-[500px] md:rounded-b-[15px] [&::-webkit-scrollbar]:hidden"
          onClick={(event) => event.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            role="button"
            aria-label="閉じる"
            onClick={onClose}
            className="absolute top-2 left-1/2 z-[10002] flex h-6 w-20 -translate-x-1/2 items-center justify-center"
          >
            <span className="pointer-events-none block h-[6px] w-full rounded-full bg-gray-300" />
          </div>
          <div className="mb-4 gap-2 px-3 py-1 text-left">
            <span className="font-bold text-[13px] text-pink-400">
              {userName}ちゃんの出品一覧
            </span>
          </div>
          <FleaMarketItemList
            items={items}
            onViewItem={onViewItem}
            onPurchase={onPurchase}
          />
        </div>
      </div>,
      document.body,
    );
  },
);

FleaMarketModal.displayName = 'FleaMarketModal';

export default FleaMarketModal;
