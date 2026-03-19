import { useSession } from '#/hooks/useSession';
import { type Dispatch, type SetStateAction, useState } from 'react';
import type { GetPresentMenuListResponseElementData } from '@/apis/get-present-menu-list';
import type { PayPresentMenuPointResponse } from '@/apis/http/present';
import { HTTP_PAY_PRESENT_MENU_POINT } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import styles from '@/styles/videocall/LovenseCarouselItems.module.css';
import type { MessageWithType } from '@/types/MessageWithType';
import type { ResponseData } from '@/types/NextApi';
import { trackEvent } from '@/utils/eventTracker';
import { showPointAwareErrorToast } from '@/utils/pointShortageToast';

type PresentMenuComponentProps = {
  presentMenuItems: GetPresentMenuListResponseElementData[];
  receiverId: string;
  callType: 'live' | 'side_watch' | 'video';
  onClose: () => void;
  onSendMessageToChannel?: ((message: any) => Promise<void>) | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  setCurrentPoint: (point: number) => void;
};

const PresentCarouselItems: React.FC<PresentMenuComponentProps> = ({
  presentMenuItems,
  receiverId,
  callType,
  onSendMessageToChannel,
  setLiveMessages,
  setCurrentPoint,
  onClose,
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

        setCurrentPoint(response.myPoint);
        trackEvent('COMPLETE_SEND_PRESENTMENU_FOR_LABEL');
        onClose();
      }
    } catch (error) {
      console.error('送信エラー:', error);
      showPointAwareErrorToast('送信エラーが発生しました');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <center>
      <div className={styles.container}>
        <div className={styles.carousel}>
          {presentMenuItems.map((item) => {
            return (
              <li key={item.index} className={styles.list}>
                <button
                  onClick={() => sendPostMenu(item)}
                  disabled={isSending}
                  className={styles.button}
                >
                  <div className={styles.flex}>
                    <div className={styles.left}>{item.text}</div>
                    <div className={styles.pt}>{item.consume_point}pt</div>
                  </div>
                </button>
              </li>
            );
          })}
        </div>
      </div>
    </center>
  );
};

export default PresentCarouselItems;
