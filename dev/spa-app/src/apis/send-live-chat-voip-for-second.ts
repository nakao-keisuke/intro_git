import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface SendLiveChatVoipForSecondRequest extends JamboRequest {
  readonly api: 'send_live_chat_voip_for_second';
  readonly token: string;
  readonly female_id: string;
  readonly male_id: string;
}

export interface SendLiveChatVoipForSecondResponseData
  extends JamboResponseData {
  channel_info: {
    readonly rtc_channel_token: string;
    readonly app_id: string;
    readonly channel_id: string;
    readonly user_count: number;
    readonly thumbnail_image_id: string;
  };
}

export function sendLiveChatVoipForSecondRequest(
  token: string,
  partnerId: string,
  userId: string,
): SendLiveChatVoipForSecondRequest {
  return {
    api: 'send_live_chat_voip_for_second',
    token: token,
    female_id: partnerId,
    male_id: userId,
  };
}
