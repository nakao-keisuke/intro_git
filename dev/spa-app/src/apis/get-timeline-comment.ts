import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type TimelineCommentListRequest = JamboRequest & {
  readonly api: 'second_apps_get_timeline_comment_list';
  readonly token: string;
  readonly timeline_id: string;
};

export type GetTimelineCommentListResponseElementData = JamboResponseData & {
  comment_text: string;
  gender: number;
  user_id: string;
  comment_type: string;
  user_name: string;
  review_status: string;
  timeline_id: string;
  comment_id: string;
  ava_id: string;
  post_time: string;
  parent_comment_id: string;
};

export const getTimelineCommentListRequest = (
  token: string,
  timelineId: string,
): TimelineCommentListRequest => {
  return {
    api: 'second_apps_get_timeline_comment_list',
    token: token,
    timeline_id: timelineId,
  };
};
