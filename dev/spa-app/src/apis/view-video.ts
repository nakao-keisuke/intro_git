import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type ViewVideoRequest = JamboRequest & {
  readonly api: 'view_video';
  readonly video_id: string;
  readonly token: string;
};

export type ViewVideoResponseData = JamboResponseData & {};

export const viewVideoRequest = (
  token: string,
  imageId: string,
): ViewVideoRequest => ({
  api: 'view_video',
  video_id: imageId,
  token,
});
