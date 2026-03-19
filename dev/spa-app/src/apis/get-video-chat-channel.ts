import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetVideoChatChannelRequest extends JamboRequest {
  readonly api: 'get_video_chat_channel';
  readonly token: string;
  readonly channel_type: 'video';
  readonly partner_id: string;
}

export interface GetVideoChatChannelResponseData extends JamboResponseData {
  channel_info: {
    readonly rtc_channel_token: string;
    readonly app_id: string;
    readonly channel_id: string;
    readonly user_count: number;
    readonly thumbnail_image_id: string;
  };
}

export function getVideoChatChannelRequest(
  token: string,
  partnerId: string,
): GetVideoChatChannelRequest {
  if (!partnerId) throw new Error('partnerId is required');

  return {
    api: 'get_video_chat_channel',
    token: token,
    channel_type: 'video',
    partner_id: partnerId,
  };
}
