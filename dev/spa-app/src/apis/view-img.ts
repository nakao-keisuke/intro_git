import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type ViewImageRequest = JamboRequest & {
  readonly api: 'view_img';
  readonly img_id: string;
  readonly token: string;
};

export type ViewImageResponseData = JamboResponseData & {};

export const viewImageRequest = (
  token: string,
  imageId: string,
): ViewImageRequest => ({
  api: 'view_img',
  img_id: imageId,
  token,
});
