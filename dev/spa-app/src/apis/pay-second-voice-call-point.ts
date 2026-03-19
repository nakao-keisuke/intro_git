import type { JamboRequest } from '@/types/JamboApi';

interface PaySecondVoiceCallPointRequest extends JamboRequest {
  readonly api: 'pay_second_voice_call_point';
  readonly token: string;
  readonly partner_id: string;
  readonly duration: number;
  readonly web_custom_consume_point_per_minute?: number;
}

export interface PaySecondVoiceCallPointResponseData {
  readonly myPoint: { point: number };
  readonly broadcasterPoint: { point: number };
}

export const paySecondVoiceCallPointRequest = (
  token: string,
  partnerId: string,
  duration: number,
): PaySecondVoiceCallPointRequest => {
  return {
    api: 'pay_second_voice_call_point',
    token,
    partner_id: partnerId,
    duration,
  };
};

export const paySecondVoiceCallPointRequestForCampaign = (
  token: string,
  partnerId: string,
  duration: number,
  customPoint: number,
): PaySecondVoiceCallPointRequest => {
  return {
    api: 'pay_second_voice_call_point',
    token,
    partner_id: partnerId,
    duration,
    web_custom_consume_point_per_minute: customPoint,
  };
};
