import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type AddBlockRequest = JamboRequest & {
  readonly api: 'add_blk';
  readonly token: string;
  readonly req_user_id: string;
};

export type AddBlockResponseData = JamboResponseData & {};

export const addBlockRequest = (
  token: string,
  targetUserId: string,
): AddBlockRequest => ({
  api: 'add_blk',
  token,
  req_user_id: targetUserId,
});
