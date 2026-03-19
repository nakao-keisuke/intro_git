import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type TimelineListRequest = JamboRequest & {
  readonly api: 'second_apps_get_timeline_list';
  readonly token?: string;
};

export type GetTimelineListResponseElementData = JamboResponseData & {
  comment_count: number;
  poster_comment: string;
  like_count: number;
  gender: number;
  poster_ava_id: string;
  type: string;
  post_time: string;
  poster_user_name: string;
  call_status: number;
  poster_age: number;
  review_status: string;
  voice_call_waiting: boolean;
  timeline_id: string;
  poster_region: number;
  poster_user_id: string;
  video_call_waiting: boolean;
  is_liked: boolean;
  image_id?: string;
};

export const getTimelineListRequest = (token?: string): TimelineListRequest => {
  return {
    api: 'second_apps_get_timeline_list',
    ...(token ? { token } : {}),
  };
};
