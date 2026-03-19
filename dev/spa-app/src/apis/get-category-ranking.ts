import type { ChannelInfo } from '@/types/ChannelInfo';
import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetCategoryRankingRequest extends JamboRequest {
  readonly api: 'get_category_ranking_for_utage_web';
  readonly token?: string;
  readonly type: number;
  readonly skip: number;
  readonly take: number;
}

export interface GetCategoryRankingResponseData extends JamboResponseData {
  readonly user_id: string;
  readonly has_lovense: boolean;
  readonly user: {
    readonly user_name: string;
    readonly ava_id: string;
    readonly gender: number;
    readonly last_login_time: string;
    readonly abt: string | undefined;
    readonly online_status_label: string;
    readonly online_status_color: string;
    readonly last_action_status_label: string;
    readonly last_action_status_color: string;
    readonly lank: number;
    readonly age: number;
    readonly voice_call_waiting: boolean;
    readonly video_call_waiting: boolean;
    readonly is_new: boolean;
    readonly region: number;
    readonly rank: number;
    readonly channel_info: ChannelInfo;
    readonly call_status: number;
  };
}

const RANKING_TYPE = {
  VIDEO_CHAT: 2,
  TWO_SHOT: 1,
  MESSAGE: 3,
};

export function getCategoryVideoChatRankingRequest(
  token?: string,
): GetCategoryRankingRequest {
  return {
    api: 'get_category_ranking_for_utage_web',
    type: RANKING_TYPE.VIDEO_CHAT,
    skip: 0,
    take: 100,
    ...(token ? { token } : {}),
  };
}

export function getCategoryTwoShotRankingRequest(
  token?: string,
): GetCategoryRankingRequest {
  return {
    api: 'get_category_ranking_for_utage_web',
    type: RANKING_TYPE.TWO_SHOT,
    skip: 0,
    take: 100,
    ...(token ? { token } : {}),
  };
}

export function getCategoryMessageRankingRequest(
  token?: string,
): GetCategoryRankingRequest {
  return {
    api: 'get_category_ranking_for_utage_web',
    type: RANKING_TYPE.MESSAGE,
    skip: 0,
    take: 100,
    ...(token ? { token } : {}),
  };
}
