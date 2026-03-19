import type { JamboRequest } from '@/types/JamboApi';

interface PaySecondLivePointRequest extends JamboRequest {
  readonly api: 'pay_second_live_point';
  readonly token: string;
  readonly broadcaster_id: string;
  readonly duration: number;
  readonly web_custom_consume_point_per_minute?: number;
  readonly is_from_web: true;
}

export interface PaySecondLivePointResponseData {
  readonly myPoint: { point: number };
  readonly broadcasterPoint: { point: number };
}

export const paySecondLivePointRequest = (
  token: string,
  partnerId: string,
  duration: number,
): PaySecondLivePointRequest => {
  return {
    api: 'pay_second_live_point',
    token,
    broadcaster_id: partnerId,
    duration,
    is_from_web: true,
  };
};

export const paySecondLivePointRequestForCampaign = (
  token: string,
  partnerId: string,
  duration: number,
  customPoint: number,
): PaySecondLivePointRequest => {
  return {
    api: 'pay_second_live_point',
    token,
    broadcaster_id: partnerId,
    duration,
    web_custom_consume_point_per_minute: customPoint,
    is_from_web: true,
  };
};
