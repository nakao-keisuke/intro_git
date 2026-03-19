import type { JamboRequest } from '@/types/JamboApi';

type GetImageRankingRequest = JamboRequest & {
  readonly api: 'get_image_ranking';
  readonly token: string;
  readonly skip: number;
  readonly take: number;
};

export type GetImageRankingResponseElementData = Array<{
  readonly is_sudden_rise: boolean;
  readonly user_id: string;
  readonly rank: number;
  readonly user: {
    readonly last_action_status_color: string;
    readonly step_to_call: number;
    readonly gender: number;
    readonly last_login_time: string;
    readonly is_new: boolean;
    readonly user_name: string;
    readonly last_action_status_label: string;
    readonly talk_theme: number;
    readonly showing_face_status: number;
    readonly last_action_status_index: number;
    readonly channel_info: string;
    readonly online_status_color: string;
    readonly abt: string;
    readonly call_status: number;
    readonly online_status_label: string;
    readonly voice_call_waiting: boolean;
    readonly region: number;
    readonly ava_id: string;
    readonly age: number;
    readonly video_call_waiting: boolean;
  };
  readonly point: number;
}>;

export const getImageRankingRequest = (
  token: string,
): GetImageRankingRequest => {
  return {
    api: 'get_image_ranking',
    token: token,
    skip: 0,
    take: 100,
  };
};
