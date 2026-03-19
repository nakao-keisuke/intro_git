import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type RemoveBlockRequest = JamboRequest & {
  readonly api: 'rmv_blk';
  readonly token: string;
  readonly blk_user_id: string;
};

export type RemoveBlockResponseData = JamboResponseData & {};

export const removeBlockRequest = (
  token: string,
  userId: string,
): RemoveBlockRequest => ({
  api: 'rmv_blk',
  token,
  blk_user_id: userId,
});
