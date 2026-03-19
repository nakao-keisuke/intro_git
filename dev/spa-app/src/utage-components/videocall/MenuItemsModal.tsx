import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { GetPresentMenuListResponseElementData } from '@/apis/get-present-menu-list';
import { usePointStore } from '@/stores/pointStore';
import type { MessageWithType } from '@/types/MessageWithType';
import PresentMenuItems from './PresentMenuItems';

type Props = {
  presentMenuItems: GetPresentMenuListResponseElementData[];
  onClose: () => void;
  receiverId: string;
  onSendMessageToChannel: ((message: any) => Promise<void>) | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  callType: 'live' | 'side_watch' | 'video';
  isPCView: boolean;
};

const MenuItemsModal = ({
  presentMenuItems,
  onClose,
  receiverId,
  onSendMessageToChannel,
  setLiveMessages,
  callType,
  isPCView,
}: Props) => {
  const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const lastTouchYRef = useRef<number | null>(null);
  const mountedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    mountedAtRef.current = Date.now();
    // DOMレイアウト計測
    const measure = () => {
      overlayRef.current?.getBoundingClientRect();
      modalRef.current?.getBoundingClientRect();
    };
    const _raf1 = requestAnimationFrame(() => {
      const _raf2 = requestAnimationFrame(measure);
      // 保存しないと cleanup できないが、測定は2フレームで完了するので OK
    });
    return () => {};
  }, [isPCView, presentMenuItems]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartYRef.current = touch.clientY;
    lastTouchYRef.current = touch.clientY;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    lastTouchYRef.current = touch.clientY;
  };

  const handleTouchEnd = () => {
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
  };

  // PC版ではbackdropなしで中身だけをレンダリング
  if (isPCView) {
    return (
      <>
        <div className="pointer-events-none relative z-[10002] mb-2 flex w-[80%] items-center justify-center whitespace-nowrap rounded-[30px] bg-[#67676753] p-[2px] text-center font-bold text-[13px] text-white tracking-[0.02em] shadow-[0_1px_3px_rgba(74,74,74,0.52)]">
          <img
            src="/live/menu.webp"
            alt="present"
            className="mr-1 h-auto w-[19px]"
          />
          ↓ チップを送って好きな仕草をリクエストしよう！
        </div>
        <div className="w-full">
          <PresentMenuItems
            presentMenuItems={presentMenuItems}
            receiverId={receiverId}
            onClose={onClose}
            callType={callType}
            onSendMessageToChannel={onSendMessageToChannel}
            setLiveMessages={setLiveMessages}
            setCurrentPoint={setCurrentPoint}
          />
        </div>
      </>
    );
  }

  // モバイル版はポータルで body に描画し、stacking context の影響を回避
  if (typeof window === 'undefined') return null;
  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10003] flex h-screen w-screen cursor-pointer flex-col items-center justify-end bg-[rgba(217,217,217,0.1)] pb-5"
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
    >
      <div
        ref={modalRef}
        className="relative z-[10001] mx-[100px] mt-5 max-h-[50vh] animate-popup cursor-default overflow-y-auto overflow-x-hidden rounded-[15px] bg-[rgba(55,55,55,0.3)] p-5 text-center [-ms-overflow-style:none] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
          <span className="pointer-events-none block h-1.5 w-12 rounded-full bg-white/40" />
        </div>
        <PresentMenuItems
          presentMenuItems={presentMenuItems}
          receiverId={receiverId}
          onClose={onClose}
          callType={callType}
          onSendMessageToChannel={onSendMessageToChannel}
          setLiveMessages={setLiveMessages}
          setCurrentPoint={setCurrentPoint}
        />
      </div>
    </div>,
    document.body,
  );
};

export default MenuItemsModal;
