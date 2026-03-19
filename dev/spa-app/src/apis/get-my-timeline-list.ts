import type { JamboResponseData } from '@/types/JamboApi';

export interface GetMyTimelineListRequestData {
  readonly api: 'second_apps_get_timeline_list_by_user_id';
  readonly token: string;
  readonly poster_user_id: string;
  readonly fetch_type: 'all';
  readonly last_post_time: null;
}

export interface GetMyTimelineListResponseData extends JamboResponseData {
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
}

export function getMyTimelineListRequest(
  token: string,
  posterUserId: string,
): GetMyTimelineListRequestData {
  return {
    api: 'second_apps_get_timeline_list_by_user_id',
    token: token,
    poster_user_id: posterUserId,
    fetch_type: 'all',
    last_post_time: null,
  };
}
