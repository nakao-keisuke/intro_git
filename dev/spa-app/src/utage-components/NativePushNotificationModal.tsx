// Image component removed (use <img> directly);
import { useEffect, useRef } from 'react';
import ReactModal from 'react-modal';
import { native } from '@/libs/nativeBridge';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * ネイティブアプリ向けプッシュ通知許可プレアラートモーダル
 * 通知が拒否（denied）された後に表示され、設定画面への誘導を行う
 * 表示順序: NewsModal → 純正通知許可モーダル → このプレアラート
 */
export default function NativePushNotificationModal({
  isOpen,
  onClose,
}: Props) {
  const originalOverflowRef = useRef<string | null>(null);

  // モーダル表示中は背景スクロールを無効化
  useEffect(() => {
    if (isOpen) {
      // 開く時に元の値を保存
      originalOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else if (originalOverflowRef.current !== null) {
      // 閉じる時に復元
      document.body.style.overflow = originalOverflowRef.current || '';
      originalOverflowRef.current = null;
    }

    return () => {
      // アンマウント時にも確実に復元
      if (originalOverflowRef.current !== null) {
        document.body.style.overflow = originalOverflowRef.current || '';
        originalOverflowRef.current = null;
      }
    };
  }, [isOpen]);

  const handleAccept = async () => {
    try {
      // 設定画面を開く（OPEN_APP_SETTINGS メッセージを送信）
      await native.openAppSettings();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
    onClose();
  };

  const handleLater = () => {
    onClose();
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      ariaHideApp={false}
      contentLabel="通知許可"
      overlayClassName="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
      className="relative w-[320px]"
    >
      <div className="relative min-h-[350px] overflow-hidden rounded-t-[24px] bg-[#F3F3F3] px-4 pt-4 pb-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <Image
          src="/images/alert.webp"
          alt="通知許可用モーダル画像"
          fill
          priority
          className="z-0 object-cover"
        />
        <div className="relative z-10 mx-auto mt-10 rounded-[16px] bg-white px-4 py-3 text-center shadow-[0_10px_18px_rgba(0,0,0,0.22)]">
          <div className="flex items-baseline justify-center whitespace-nowrap">
            <span className="font-bold text-[#FF0B89] text-[22px] tracking-wide">
              今、返事待ってるかも
            </span>
          </div>
          <p className="mt-1 text-center font-medium text-[#6B6B6B] text-[12px]">
            通知ONで新着メッセージにすぐ気づけます
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4 rounded-b-[17px] bg-[#434343] px-4 py-4">
        {/* 後で */}
        <button
          className="h-[40px] w-[120px] rounded-[7px] bg-[#D9D9D9] font-medium text-base text-white shadow-md transition-all hover:bg-[#C9C9C9] active:translate-y-0.5"
          onClick={handleLater}
        >
          後で
        </button>

        <button
          className="h-[40px] w-[120px] rounded-[7px] bg-gradient-to-r from-[#FF0B89] to-[#FF7BC8] font-medium text-base text-white shadow-[0_8px_16px_rgba(255,11,137,0.35)] transition-all hover:from-[#E60078] hover:to-[#F06BB6] active:translate-y-0.5"
          onClick={handleAccept}
        >
          受け取る
        </button>
      </div>
    </ReactModal>
  );
}
