import { IconGift } from '@tabler/icons-react';
import { useSession } from '#/hooks/useSession';
import { type Dispatch, type SetStateAction, useState } from 'react';
import type { GetPresentMenuListResponseElementData } from '@/apis/get-present-menu-list';
import type { PayPresentMenuPointResponse } from '@/apis/http/present';
import { HTTP_PAY_PRESENT_MENU_POINT } from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { MessageWithType } from '@/types/MessageWithType';
import type { ResponseData } from '@/types/NextApi';
import { trackEvent } from '@/utils/eventTracker';
import { showPointAwareErrorToast } from '@/utils/pointShortageToast';

type PresentMenuItemsProps = {
  presentMenuItems: GetPresentMenuListResponseElementData[];
  receiverId: string;
  onClose: () => void;
  callType: 'live' | 'side_watch' | 'video';
  onSendMessageToChannel?: ((message: any) => Promise<void>) | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  setCurrentPoint: (point: number) => void;
};

const PresentMenuItems: React.FC<PresentMenuItemsProps> = ({
  presentMenuItems,
  receiverId,
  onClose,
  callType,
  onSendMessageToChannel,
  setLiveMessages,
  setCurrentPoint,
}) => {
  const [isSending, setIsSending] = useState(false);
  const { data: session } = useSession();

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

        onClose();
      }
    } catch (error) {
      console.error('投稿エラー:', error);
      showPointAwareErrorToast('投稿エラーが発生しました');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="relative border-white border-b text-[14px]">
        <div className="p-1">
          <ul className="m-0 list-none p-0">
            {presentMenuItems.map((item) => (
              <li key={item.index} className="my-2 flex justify-center px-2">
                <button
                  onClick={() => sendPostMenu(item)}
                  disabled={isSending}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-white shadow-sm outline-none transition-colors hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {/* 左アイコン */}
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-pink-500/60 text-pink-200">
                    <IconGift className="h-4 w-4" />
                  </span>

                  {/* タイトル */}
                  <span className="flex-1 truncate text-left text-[15px] text-white/95 leading-tight">
                    {item.text}
                  </span>

                  {/* 右のポイント（背景なし・白文字） */}
                  <span className="inline-flex shrink-0 items-baseline gap-1">
                    <span className="font-bold text-white text-xl leading-none tracking-tight">
                      {item.consume_point}
                    </span>
                    <span className="font-bold text-[11px] text-white leading-none">
                      pt
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PresentMenuItems;
