import { useSession } from '#/hooks/useSession';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { LovenseMenuItem } from '@/apis/http/lovense';
import { useLiveStore } from '@/features/live/store/liveStore';
import type { MessageWithType } from '@/types/MessageWithType';
import { sendPostMenu } from '@/utils/sendLovenseMenu';

// 対象となるLovenseメニューのtype（弱〜ウェーブ）
const TARGET_TYPES = ['weak', 'medium', 'strong', 'pulse', 'wave'];

type LovenseQuickMenuProps = {
  lovenseMenuItems: LovenseMenuItem[];
  receiverId: string;
  callType: 'live' | 'side_watch' | 'video';
  onSendMessageToChannel?:
    | ((message: Record<string, unknown>) => Promise<void>)
    | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  setCurrentPoint: (point: number) => void;
  isModalOpen?: boolean;
  onTicketUsed?: (() => void) | undefined;
};

const LovenseQuickMenu: React.FC<LovenseQuickMenuProps> = ({
  lovenseMenuItems,
  receiverId,
  callType,
  onSendMessageToChannel,
  setLiveMessages,
  setCurrentPoint,
  isModalOpen = false,
  onTicketUsed,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [randomThreeItems, setRandomThreeItems] = useState<LovenseMenuItem[]>(
    [],
  );
  const { data: session } = useSession();
  const setLatestLiveChatMessage = useLiveStore(
    (s) => s.setLatestLiveChatMessage,
  );

  // 対象メニュー（弱〜ウェーブ）をフィルタリング（メモ化）
  const targetMenuItems = useMemo(
    () => lovenseMenuItems.filter((item) => TARGET_TYPES.includes(item.type)),
    [lovenseMenuItems],
  );

  // ランダム3つを選択してポイント小さい順にソート
  const selectRandomThree = useCallback(() => {
    if (targetMenuItems.length <= 3) {
      const sorted = [...targetMenuItems].sort(
        (a, b) => a.consumePoint - b.consumePoint,
      );
      setRandomThreeItems(sorted);
    } else {
      const shuffled = [...targetMenuItems].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 3);
      const sorted = selected.sort((a, b) => a.consumePoint - b.consumePoint);
      setRandomThreeItems(sorted);
    }
  }, [targetMenuItems]);

  // 1分ごとにランダム更新
  useEffect(() => {
    selectRandomThree(); // 初回
    const interval = setInterval(selectRandomThree, 60000); // 1分ごと

    return () => clearInterval(interval);
  }, [selectRandomThree]);

  const handleSendPostMenu = async (item: LovenseMenuItem) => {
    if (isSending) return;
    setIsSending(true);

    try {
      const success = await sendPostMenu({
        item,
        receiverId,
        callType,
        session,
        onSendMessageToChannel,
        setLiveMessages,
        setCurrentPoint,
        onTicketUsed,
        isFromQuickMenu: true,
        source: 'quick_menu',
        rethrowOnException: true,
      });

      // LiveChatAreaに表示させるため、自己送信メッセージをRecoil経由で通知
      // 自分のsender_idを渡すとLiveChatArea側で自己メッセージを無視するため、sender_idは付与しない
      if (success && (callType === 'live' || callType === 'side_watch')) {
        const message = `${item.duration}秒の${item.displayName}`;
        setLatestLiveChatMessage({
          text: `${session?.user?.name}: ${message}`,
        });
      }
    } catch (error) {
      console.error('投稿エラー:', error);
      alert('投稿エラーが発生しました');
    } finally {
      setIsSending(false);
    }
  };

  if (randomThreeItems.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed top-[70px] right-2 z-[1000] w-[90px] ${isModalOpen ? 'pointer-events-none' : ''}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* 全体を囲む枠 */}
      <div className="rounded-2xl border border-white/25 bg-gradient-to-b from-pink-300/30 via-pink-400/30 to-purple-400/30 p-2">
        {/* ヘッダー */}
        <div className="mb-1 pb-0 text-center font-normal text-[12px] text-white">
          Lovense
        </div>

        {/* メニューアイテム */}
        <div className="flex flex-col gap-1.5">
          {randomThreeItems.map((item) => {
            const hasTicket = item.ticketCount === 1;
            return (
              <button
                key={item.index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendPostMenu(item);
                }}
                disabled={isSending}
                className="flex h-[70px] flex-col items-center justify-between rounded-xl border-2 border-amber-300 px-1 py-1.5 font-bold text-[11px] text-white leading-snug shadow-sm transition-all hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {/* メニュー名 */}
                <span className="mb-1 line-clamp-2 flex w-full flex-1 items-center justify-center break-words text-center">
                  {item.duration}秒
                  <br />
                  {item.displayName}
                </span>
                {/* ポイント表示 */}
                <div className="flex items-center gap-0.5">
                  {hasTicket ? (
                    <span className="font-bold text-[9px] text-amber-600">
                      チケット
                    </span>
                  ) : (
                    <>
                      <span className="inline-block h-3 w-3 rounded-full bg-yellow-400 text-center font-bold text-[8px] text-black leading-[14px]">
                        P
                      </span>
                      <span className="font-bold text-[10px] text-white">
                        {item.consumePoint}pt
                      </span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LovenseQuickMenu;
