import type { JamboResponseData } from '@/types/JamboApi';

interface GetTimelineNotificationRequestData {
  readonly api: 'second_apps_get_timeline_reaction_list';
  readonly token: string;
}

export interface GetTimelineNotificationResponseData extends JamboResponseData {
  contents_image_id: string;
  comment_text: string;
  avatar_id: string;
  contents_text: string;
  action_time: string;
  reaction_type: 'like' | 'comment';
  user_id: string;
  user_name: string;
  timeline_id: string;
  contents_type: string;
}

export function getTimelineNotificationRequest(
  token: string,
): GetTimelineNotificationRequestData {
  return {
    api: 'second_apps_get_timeline_reaction_list',
    token: token,
  };
}
