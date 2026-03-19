import type { JamboResponseData } from '@/types/JamboApi';

interface GetTimelineDetailRequestData {
  readonly api: 'second_apps_get_timeline_by_timeline_id';
  readonly token: string;
  readonly timeline_id: string;
}

export interface GetTimelineDetailResponseData extends JamboResponseData {
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

export function getTimelineDetailRequest(
  token: string,
  timelineId: string,
): GetTimelineDetailRequestData {
  return {
    api: 'second_apps_get_timeline_by_timeline_id',
    token: token,
    timeline_id: timelineId,
  };
}
