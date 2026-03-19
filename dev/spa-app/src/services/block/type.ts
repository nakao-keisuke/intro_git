import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { Region } from '@/utils/region';

export type BlockListRequest = APIRequest & {
  token?: string;
  skip: number;
  take: number;
};

export type BlockListResponse = {
  blockList: BlockListUserInfo[];
};

export type RemoveBlockRequest = APIRequest & {
  userId: string;
};

export type RemoveBlockResponse = APIResponse<null>;

export type BlockListUserInfo = {
  userId: string;
  userName: string;
  avatarId: string;
  region: Region;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
};
