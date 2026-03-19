import type { JamboRequest } from '@/types/JamboApi';

interface PayLovenseMenuPointRequest extends JamboRequest {
  readonly api: 'pay_second_lovense_menu_point';
  readonly token: string;
  readonly partner_id: string;
  readonly type: string;
  readonly consume_point: number;
  readonly duration: number;
  readonly call_type: 'live' | 'side_watch' | 'video';
  readonly is_free_action?: boolean;
}

export interface PayLovenseMenuPointResponseData {
  readonly my_point: {
    point: number;
    untradable_point: number;
    tradable_point: number;
  };
  // ビデオ通話時はpartner_point、ビデオチャット時はbroadcaster_point
  readonly partner_point?: {
    point: number;
    untradable_point: number;
    tradable_point: number;
  };
  readonly broadcaster_point?: {
    point: number;
    untradable_point: number;
    tradable_point: number;
  };
}

export const PayLovenseMenuPointRequest = (
  token: string,
  partnerId: string,
  type: string,
  consumePoint: number,
  duration: number,
  callType: 'live' | 'side_watch' | 'video',
  isFreeAction?: boolean,
): PayLovenseMenuPointRequest => {
  return {
    api: 'pay_second_lovense_menu_point' as const,
    token: token,
    partner_id: partnerId,
    type: type,
    consume_point: consumePoint,
    duration: duration,
    call_type: callType,
    ...(isFreeAction !== undefined && { is_free_action: isFreeAction }),
  };
};
