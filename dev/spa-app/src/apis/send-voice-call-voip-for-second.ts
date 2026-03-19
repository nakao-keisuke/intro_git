import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface SendVoiceCallVoipForSecondRequest extends JamboRequest {
  readonly api: 'send_voice_call_voip_for_second';
  readonly token: string;
  readonly channel_type: 'voice';
  readonly partner_id: string;
}

export interface SendVoiceCallVoipForSecondResponseData
  extends JamboResponseData {
  channel_info: {
    readonly talk_theme: string;
    readonly rtc_channel_token: string;
    readonly title: string;
    readonly channel_type: string;
    readonly channel_id: string;
    readonly app_id: string;
    readonly call_type: string;
    readonly rtm_channel_token: string;
    readonly user_count: number;
    readonly thumbnail_image_id: string;
  };
}

export function sendVoiceCallVoipForSecondRequest(
  token: string,
  partnerId: string,
): SendVoiceCallVoipForSecondRequest {
  return {
    api: 'send_voice_call_voip_for_second',
    token: token,
    channel_type: 'voice',
    partner_id: partnerId,
  };
}
