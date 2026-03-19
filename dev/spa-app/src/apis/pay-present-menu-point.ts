import type { JamboRequest } from '@/types/JamboApi';

interface PayPresentMenuPointRequest extends JamboRequest {
  readonly api: 'pay_second_video_chat_menu_point';
  readonly partner_id: string;
  readonly token: string;
  readonly text: string;
  readonly consume_point: number;
  readonly type: string;
  readonly call_type: 'live' | 'side_watch' | 'video';
}

export interface PayPresentMenuPointResponseData {
  readonly my_point: { point: number };
  readonly broadcaster_point: { point: number };
}

export const payPresentMenuPointRequest = (
  partnerId: string,
  token: string,
  text: string,
  consumePoint: number,
  type: string,
  callType: 'live' | 'side_watch' | 'video',
): PayPresentMenuPointRequest => {
  return {
    api: 'pay_second_video_chat_menu_point',
    partner_id: partnerId,
    token: token,
    text: text,
    consume_point: consumePoint,
    type: type,
    call_type: callType,
  };
};
