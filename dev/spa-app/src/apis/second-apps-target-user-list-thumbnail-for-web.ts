import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type SecondAppsTargetUserListThumbnailForWebRequest = JamboRequest & {
  readonly api: 'second_apps_target_user_list_thumbnail_for_web';
  readonly target_user_id: string;
};

export type SecondAppsTargetUserListThumbnailForWebResponseData =
  JamboResponseData & (ImageThumbnail | VideoThumbnail);
export type ImageThumbnail = {
  readonly type: 'image';
  readonly thumbnail_url: string;
};
export type VideoThumbnail = {
  readonly type: 'movie';
  readonly thumbnail_url: string;
  readonly timeline_movie_url: string;
};

export const secondAppsTargetUserListThumbnailForWebRequest = (
  partnerId: string,
): SecondAppsTargetUserListThumbnailForWebRequest => {
  return {
    api: 'second_apps_target_user_list_thumbnail_for_web',
    target_user_id: partnerId,
  };
};
