import { useSession } from '#/hooks/useSession';
import { type Dispatch, type SetStateAction, useState } from 'react';
import type { GetPresentMenuListResponseElementData } from '@/apis/get-present-menu-list';
import type { PayPresentMenuPointResponse } from '@/apis/http/present';
import { HTTP_PAY_PRESENT_MENU_POINT } from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import { useLiveStore } from '@/features/live/store/liveStore';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { MessageWithType } from '@/types/MessageWithType';
import type { ResponseData } from '@/types/NextApi';
import { trackEvent } from '@/utils/eventTracker';
import { showPointAwareErrorToast } from '@/utils/pointShortageToast';

type OnegaiQuickMenuProps = {
  presentMenuItems: GetPresentMenuListResponseElementData[];
  receiverId: string;
  callType: 'live' | 'side_watch' | 'video';
  onSendMessageToChannel?: ((message: any) => Promise<void>) | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  setCurrentPoint: Dispatch<SetStateAction<number>>;
  isModalOpen?: boolean;
};

const OnegaiQuickMenu: React.FC<OnegaiQuickMenuProps> = ({
  presentMenuItems,
  receiverId,
  callType,
  onSendMessageToChannel,
  setLiveMessages,
  setCurrentPoint,
  isModalOpen = false,
}) => {
  const [isSending, setIsSending] = useState(false);
  const { data: session } = useSession();
  const setLatestLiveChatMessage = useLiveStore(
    (s) => s.setLatestLiveChatMessage,
  );

  // おねだりメニューの上位3つを直書き
  const topThreeItems: GetPresentMenuListResponseElementData[] = [
    {
      text: 'キス顔\nして💋',
      consume_point: 50,
      index: 1,
      type: 'キス顔して💋',
    },
    {
      text: 'ブラちら\n見せして',
      consume_point: 50,
      index: 2,
      type: 'ブラちら見せして',
    },
    {
      text: 'どの遠隔\nメニュー',
      consume_point: 50,
      index: 3,
      type: 'どの遠隔メニュー',
    },
  ];

  const sendPostMenu = async (item: GetPresentMenuListResponseElementData) => {
    if (isSending) return;
    setIsSending(true);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<
        ResponseData<PayPresentMenuPointResponse>
      >(HTTP_PAY_PRESENT_MENU_POINT, {
        partner_id: receiverId,
        text: item.text,
        consume_point: item.consume_point,
        type: item.type,
        call_type: callType,
      });

      if (response.type === 'error') {
        showPointAwareErrorToast(response.message || 'エラーが発生しました');
      } else {
        const increasePoint = item.consume_point * 0.3;
        const basePoint = 12;
        const times = Math.round(increasePoint / basePoint);
        const message = `「${item.text}」${item.consume_point}ptのチップを送信しました！🎁`;

        // 相手への通知メッセージ
        const partnerMessage = {
          text: message,
          sender_name: session?.user?.name,
          sender_id: session?.user?.id,
          message_type: 'chat',
          receiver_id: receiverId,
          increase_point: increasePoint,
        };

        if (onSendMessageToChannel) {
          await onSendMessageToChannel(partnerMessage);
          for (let i = 0; i < times; i++) {
            await onSendMessageToChannel({
              message_type: 'increasePoint',
              increase_point: basePoint,
            });
          }
        }

        // 自分が送信したメッセージをliveMessagesに追加
        if (callType === 'live' || callType === 'side_watch') {
          setLiveMessages((prev) => [
            ...prev,
            {
              text: `${session?.user?.name}: ${message}`,
              type: 'normal',
              ...(session?.user?.id && { sender_id: session.user.id }),
            },
          ]);
        }

        setCurrentPoint(response.myPoint);

        // GA4・Reproイベント送信
        if (callType === 'live' || callType === 'side_watch') {
          // ビデオチャット
          trackEvent(event.SEND_GIFT_IN_VIDEO_CHAT, {
            partner_id: receiverId,
            price: item.consume_point,
            user_id: session?.user?.id,
            gift_name: item.text,
            call_type: callType,
          });
        } else if (callType === 'video') {
          // ビデオ通話
          trackEvent(event.SEND_GIFT_IN_VIDEO_CALL, {
            partner_id: receiverId,
            price: item.consume_point,
            user_id: session?.user?.id,
            gift_name: item.text,
            call_type: callType,
          });
        }

        // LiveChatAreaに表示させるため、自己送信メッセージをRecoil経由で通知
        // 自分のsender_idを渡すとLiveChatArea側で自己メッセージを無視するため、sender_idは付与しない
        setLatestLiveChatMessage({
          text: `${session?.user?.name}: 「${item.text}」${item.consume_point}ptのチップを送信しました！🎁`,
        });
      }
    } catch (error) {
      console.error('投稿エラー:', error);
      showPointAwareErrorToast('投稿エラーが発生しました');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`fixed top-[70px] right-2 z-[1000] w-[80px] ${isModalOpen ? 'pointer-events-none' : ''}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* 全体を囲む枠 */}
      <div className="rounded-2xl border border-white/40 p-2">
        {/* ヘッダー */}
        <div className="mb-1 pb-0 text-center font-normal text-[12px] text-white">
          おねだり
        </div>

        {/* メニューアイテム */}
        <div className="flex flex-col gap-1.5">
          {topThreeItems.map((item) => (
            <button
              key={item.index}
              onClick={(e) => {
                e.stopPropagation();
                sendPostMenu(item);
              }}
              disabled={isSending}
              className="flex min-h-[60px] flex-col items-center justify-between rounded-xl border border-white/30 px-2 py-2.5 text-[11px] text-white leading-snug shadow-sm transition-all hover:bg-white/10 active:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* メニュー名 */}
              <span className="mb-1 line-clamp-2 flex w-full flex-1 items-center justify-center break-words text-center">
                {item.text}
              </span>
              {/* ポイント表示 */}
              <div className="flex items-center gap-0.5">
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-yellow-400 text-center font-bold text-[9px] text-black leading-[14px]">
                  P
                </span>
                <span className="font-bold text-[11px]">
                  {item.consume_point}pt
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnegaiQuickMenu;
