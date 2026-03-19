// Image component removed (use <img> directly);
import { useBookmark } from '@/hooks/useBookmark';
import { trackEvent } from '@/utils/eventTracker';
import RoundedThumbnail from './RoundedThumbnail';

const bookmarkBeforePic = '/before_fav_icon.webp';

export type FavoriteAlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  userName?: string;
  avatarId?: string;
  onBookmarkSuccess?: () => void;
};

/**
 * お気に入り促進アラートモーダル
 *
 * 3通目のメッセージ送信後に表示され、お気に入り登録を促す
 */
export const FavoriteAlertModal = ({
  isOpen,
  onClose,
  partnerId,
  userName,
  avatarId,
  onBookmarkSuccess,
}: FavoriteAlertModalProps) => {
  const { addBookmark, bookmarkCooldown } = useBookmark(partnerId, false);

  // お気に入り登録処理
  const handleAddBookmark = async () => {
    try {
      await addBookmark();
      trackEvent('TAP_ADD_BOOKMARK');
      onBookmarkSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      alert('お気に入りの追加に失敗しました。');
    }
  };

  // オーバーレイクリックで閉じる
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 text-center"
      onClick={handleOverlayClick}
    >
      <div className="relative z-[2001] flex w-[90%] max-w-md flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-pink-200 to-cyan-200 p-8 text-center shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-600/75 font-bold text-white text-xl shadow-md transition-colors hover:bg-gray-700"
          aria-label="閉じる"
        >
          ×
        </button>

        <div className="mb-2 whitespace-pre-line rounded-lg text-center font-bold text-gray-700 text-lg">
          お相手をお気に入り登録しませんか？
        </div>
        <div className="mb-4 text-center text-gray-600 text-sm">
          お気に入りに登録すると、チャット受信・配信開始時に通知が届きます。
        </div>

        <div className="relative mb-6 flex w-4/5 flex-col items-center justify-center rounded-full bg-white/63 px-2 py-6">
          <div className="relative flex h-16 w-16 items-center justify-center self-center text-center">
            <RoundedThumbnail
              avatarId={avatarId || ''}
              deviceCategory="mobile"
              customSize={{ width: 60, height: 60 }}
            />
          </div>
          <div className="mb-3 font-bold text-base text-gray-800">
            {userName || ''}さん
          </div>
          <div className="flex items-center justify-center">
            <button
              className="mb-3 flex cursor-pointer items-center gap-2 rounded-full bg-pink-500 px-6 py-3 shadow-lg transition-all hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleAddBookmark}
              disabled={bookmarkCooldown}
            >
              <Image
                src={bookmarkBeforePic}
                alt="お気に入りする"
                width={30}
                className="brightness-0 invert"
              />
              <p className="m-0 font-bold text-lg text-white">
                お気に入りに追加する
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
