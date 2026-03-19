import type { JamboRequest } from '@/types/JamboApi';
import { payPointPerMinute } from '@/utils/callView';

interface PaySecondVideoCallPointRequest extends JamboRequest {
  readonly api: 'pay_second_video_call_point';
  readonly token: string;
  readonly partner_id: string;
  readonly duration: number;
  readonly web_custom_consume_point_per_minute?: number;
}

export interface PaySecondVideoCallPointResponseData {
  readonly my_point: { point: number };
  readonly broadcaster_point: { point: number };
}

export const paySecondVideoCallPointRequest = (
  token: string,
  partnerId: string,
  duration: number,
): PaySecondVideoCallPointRequest => {
  return {
    api: 'pay_second_video_call_point',
    token,
    partner_id: partnerId,
    duration,
    web_custom_consume_point_per_minute: payPointPerMinute(
      'videoCallFromOutgoing',
    ),
  };
};

export const paySecondVideoCallPointRequestForCampaign = (
  token: string,
  partnerId: string,
  duration: number,
  customPoint: number,
): PaySecondVideoCallPointRequest => {
  return {
    api: 'pay_second_video_call_point',
    token,
    partner_id: partnerId,
    duration,
    web_custom_consume_point_per_minute: customPoint,
  };
};
