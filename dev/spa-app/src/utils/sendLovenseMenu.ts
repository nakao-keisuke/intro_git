import type { Session } from 'next-auth';
import type {
  LovenseMenuItem,
  PayLovenseMenuPointResponse,
} from '@/apis/http/lovense';
import { HTTP_PAY_LOVENSE_MENU_POINT } from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { CALL_ERROR_CATEGORY } from '@/types/callErrorCategory';
import type { MessageWithType } from '@/types/MessageWithType';
import type { ResponseData } from '@/types/NextApi';
import { trackEvent } from '@/utils/eventTracker';
import { showPointAwareErrorToast } from '@/utils/pointShortageToast';
import { captureCallError } from '@/utils/sentry/captureCallError';

type SendPostMenuParams = {
  item: LovenseMenuItem;
  receiverId: string;
  callType: 'live' | 'side_watch' | 'video';
  session: Session | null;
  // オプショナルなコールバック
  onSendMessageToChannel?:
    | ((message: Record<string, unknown>) => Promise<void>)
    | undefined;
  setLiveMessages?:
    | React.Dispatch<React.SetStateAction<MessageWithType[]>>
    | undefined;
  setCurrentPoint?: ((point: number) => void) | undefined;
  onTicketUsed?: (() => void | Promise<void>) | undefined;
  isFreeAction?: boolean;
  isFromQuickMenu?: boolean;
  messageText?: string;
  source?: 'quick_menu' | 'carousel' | 'menu_items' | 'sendLovenseMenu';
  skipTracking?: boolean;
  rethrowOnException?: boolean;
};

export const sendPostMenu = async ({
  item,
  receiverId,
  callType,
  session,
  onSendMessageToChannel,
  setLiveMessages,
  setCurrentPoint,
  onTicketUsed,
  isFreeAction = false,
  isFromQuickMenu = false,
  messageText,
  source,
  skipTracking = false,
  rethrowOnException = false,
}: SendPostMenuParams): Promise<boolean> => {
  const hasTicket = item.ticketCount && item.ticketCount > 0;
  const isFullControl = item.type === 'full_control';
  // isFreeActionの場合も実際のconsumePointを送信（バックエンドがis_free_actionでポイント消費をスキップ）
  // チケット使用時のみ0を送信
  const consumePoint = hasTicket ? 0 : item.consumePoint;
  const increasePoint = item.consumePoint * 0.3;
  const basePoint = 12;
  const times = Math.round(increasePoint / basePoint);

  try {
    const client = new ClientHttpClient();
    const response = await client.post<
      ResponseData<PayLovenseMenuPointResponse>
    >(HTTP_PAY_LOVENSE_MENU_POINT, {
      partner_id: receiverId,
      type: item.type,
      consume_point: consumePoint,
      duration: item.duration,
      call_type: callType,
      is_free_action: isFreeAction,
    });

    if (response.type === 'error') {
      if (response.isLovenseOffline) {
        // 相手への通知メッセージ
        const partnerOfflineMessage =
          'Lovenseとの接続が切れました。Lovenseアプリを開くと自動で再接続されます。自動接続されない場合、手動で再接続してください。';
        // 自分への通知メッセージ
        const myOfflineMessage =
          '相手のLovenseがオフライン状態のため送信できませんでした';

        const partnerMessage = {
          text: partnerOfflineMessage,
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
        if (isFullControl) {
          showPointAwareErrorToast(myOfflineMessage);
        } else if (callType === 'live' || callType === 'side_watch') {
          showPointAwareErrorToast(myOfflineMessage);
        }
        if (!isFullControl && callType === 'video') {
          alert('相手のLovenseがオフライン状態のため送信できませんでした。');
        }
      } else {
        // その他のエラーの場合
        const errorMessage = response.message || 'エラーが発生しました';

        if (isFullControl) {
          showPointAwareErrorToast(errorMessage);
        } else if (callType === 'live' || callType === 'side_watch') {
          showPointAwareErrorToast(errorMessage);
        }
        if (!isFullControl && callType === 'video') {
          alert(errorMessage);
        }
      }
      return false;
    } else {
      const message = messageText ?? `${item.duration}秒の${item.displayName}`;

      // 自分への通知メッセージ
      const myMessage = {
        text: message,
      };

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

      if (
        setLiveMessages &&
        (callType === 'live' || callType === 'side_watch')
      ) {
        setLiveMessages((prevMessages) => [
          ...prevMessages,
          {
            text: `${session?.user?.name}: ${myMessage.text}`,
            type: 'normal',
            ...(session?.user?.id && { sender_id: session.user.id }),
          },
        ]);
      }
      if (setCurrentPoint) {
        setCurrentPoint(response.myPoint);
      }

      if (!skipTracking) {
        // GA4・Reproイベント送信（無料アクションとQuickMenuからの送信は除く）
        if (!isFreeAction && !isFromQuickMenu) {
          if (callType === 'live' || callType === 'side_watch') {
            // ビデオチャット
            trackEvent(event.SEND_LOVENSE_IN_VIDEO_CHAT, {
              partner_id: receiverId,
              price: item.consumePoint,
              user_id: session?.user?.id,
              lovense_name: item.type,
              call_type: callType,
            });
          } else if (callType === 'video') {
            // ビデオ通話
            trackEvent(event.SEND_LOVENSE_IN_VIDEO_CALL, {
              partner_id: receiverId,
              price: item.consumePoint,
              user_id: session?.user?.id,
              lovense_name: item.type,
              call_type: callType,
            });
          }
        }

        // QuickMenuからの送信の場合は専用イベントを送信（無料アクションの場合は送信しない）
        if (isFromQuickMenu && !isFreeAction) {
          trackEvent(event.SEND_LOVENSE_FROM_QUICK_MENU, {
            partner_id: receiverId,
            price: item.consumePoint,
            user_id: session?.user?.id,
            lovense_name: item.type,
            call_type: callType,
          });
        }
      }

      // チケットを使用した場合はコールバックを呼び出す
      if (hasTicket && onTicketUsed) {
        try {
          await onTicketUsed();
        } catch (error) {
          console.error('[sendPostMenu] onTicketUsed callback error:', error);
        }
      }
      return true;
    }
  } catch (error) {
    console.error('Exception occurred:', error);
    captureCallError(error, CALL_ERROR_CATEGORY.LOVENSE_POST_ERROR, {
      callType,
      partnerId: receiverId,
      menuType: item.type,
      durationSec: item.duration,
      consumePoint: item.consumePoint,
      hasTicket,
      source: source ?? (isFromQuickMenu ? 'quick_menu' : 'sendLovenseMenu'),
      isFreeAction,
    });
    if (rethrowOnException) {
      throw error;
    }
    return false;
  }
};
