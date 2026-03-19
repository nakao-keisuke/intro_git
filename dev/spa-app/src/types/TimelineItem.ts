export type TimelineItem = {
  comment_count: number;
  poster_comment: string;
  like_count: number;
  gender: number;
  poster_ava_id: string;
  type: string;
  post_time: string;
  poster_user_name: string;
  poster_age: number;
  review_status: string;
  voice_call_waiting: boolean;
  timeline_id: string;
  poster_region: number;
  poster_user_id: string;
  video_call_waiting: boolean;
  is_liked: boolean;
};

export type GetTimelineResponseData = {
  code: number;
  data: TimelineItem[];
};
