import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type AddOpenedContentRequest = JamboRequest & {
  readonly api: 'add_opened_content';
  readonly token: string;
  readonly file_id: string;
  readonly is_image?: boolean;
  readonly opened_content_type?: 'audio' | 'image' | 'video';
};

export type AddOpenedContentResponseData = JamboResponseData & {};

export const addOpenedContentRequest = (
  token: string,
  fileId: string,
  is_image?: boolean,
  opened_content_type?: 'audio' | 'image' | 'video',
): AddOpenedContentRequest => ({
  api: 'add_opened_content',
  token,
  file_id: fileId,
  ...(is_image !== undefined && { is_image }),
  ...(opened_content_type !== undefined && { opened_content_type }),
});
