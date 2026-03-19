import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type getTimelineRequest = JamboRequest & {
  api: 'second_apps_get_timeline_list_by_user_id';
  token: string;
  poster_user_id: string;
  fetch_type: 'post_only';
};
export interface GetTimelineResponseData extends JamboResponseData {
  readonly comment_count: number;
  readonly poster_comment: string;
  readonly like_count: number;
  readonly gender: number;
  readonly poster_ava_id: string;
  readonly type: string;
  readonly post_time: string;
  readonly poster_user_name: string;
  readonly poster_age: number;
  readonly review_status: string;
  readonly voice_call_waiting: boolean;
  readonly timeline_id: string;
  readonly poster_region: number;
  readonly poster_user_id: string;
  readonly video_call_waiting: boolean;
  readonly is_liked: boolean;
}

export const getTimelineRequest = (
  token: string,
  partnerId: string,
): getTimelineRequest => ({
  api: 'second_apps_get_timeline_list_by_user_id',
  token,
  poster_user_id: partnerId,
  fetch_type: 'post_only',
});
