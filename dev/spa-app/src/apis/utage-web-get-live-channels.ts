import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type UtageWebGetLiveChannelsRequest = JamboRequest & {
  readonly api: 'utage_web_get_live_channels';
  readonly gender: 0 | 1 | 2;
};

export type UtageWebGetLiveChannelsResponseData = JamboResponseData & {
  standbyList: readonly UtageWebLiveChannelElementData[];
  inLiveList: readonly UtageWebLiveChannelElementData[];
};

export type UtageWebLiveChannelElementData = {
  channelInfo: {
    readonly rtc_channel_token: string;
    readonly app_id: string;
    readonly channel_id: string;
    readonly user_count: number;
    readonly thumbnail_image_id: string;
  };
  broadcaster: {
    readonly user_name: string;
    readonly region: number;
    readonly age: number;
    readonly abt: string;
    readonly ava_id: string;
    readonly user_id: string;
    readonly is_new_user: boolean;
    readonly bdy_tpe: readonly number[];
    readonly inters: number[];
    readonly talk_theme: number;
    readonly step_to_call: number;
    readonly marriage_history: number;
    readonly showing_face_status: number;
    readonly personalities: readonly number[];
    readonly is_live_now: boolean;
    readonly last_login_time: string;
    readonly often_visit_time?: string;
    readonly job?: string;
    readonly looks?: string;
    readonly holidays?: string;
    readonly hometown?: string;
    readonly blood_type?: string;
    readonly housemate?: string;
    readonly smoking_status?: string;
    readonly alcohol?: string;
    readonly constellation?: string;
    readonly has_lovense: boolean;
    readonly h_level?: string;
    readonly bust_size?: string;
  };
};

export function utageWebGetLiveChannelsRequest(): UtageWebGetLiveChannelsRequest {
  return {
    api: 'utage_web_get_live_channels',
    gender: 1,
  };
}
