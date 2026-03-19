import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { LiveCallType } from '@/utils/callView';
import type { Region } from '@/utils/region';

export type BoardFilterParams = {
  callWaiting?: 'video' | 'voice';
  age?: string;
  region?: string;
};

export type BoardMessageListRequest = APIRequest & {
  token?: string;
  skip: number;
} & BoardFilterParams;

export type UtageWebPointInfoRequest = APIRequest & {
  token?: string;
};

export type BoardMessageListResponse = {
  boardList: BoardListUserInfo[];
  hasMore?: boolean;
  nextSkip?: number;
};

export type PostBoardMessageRequest = APIRequest & {
  token?: string;
  message: string;
};

export type PostBoardMessageResponse = APIResponse<null>;

export type Board = {
  userId: string;
  userName: string;
  age: number;
  region: Region;
  avaId: string;
  voiceCallWaiting?: boolean;
  videoCallWaiting?: boolean;
  message: string;
  created: string;
  hasLovense: boolean;
  bustSize?: string;
  hLevel?: string;
  isNewUser?: boolean;
  regDate?: string;
  isOnline: boolean;
};

// 掲示板用のチャンネル情報（即時入室に必要）
export type BoardChannelInfo = {
  rtcChannelToken: string;
  appId: string;
  channelId: string;
  userCount: number;
  thumbnailImageId: string;
};

// 掲示板用の配信者情報（即時入室に必要）
export type BoardBroadcasterInfo = {
  userName: string;
  age: number;
  avatarId: string;
  userId: string;
  isNewUser: boolean;
  hasLovense: boolean;
  isLiveNow: boolean;
  region: number;
  showingFaceStatus: number;
  about: string;
  bodyType?: number[] | undefined;
  interests?: number[] | undefined;
  marriageHistory?: number | undefined;
  personalities?: number[] | undefined;
  stepToCall?: number | undefined;
  talkTheme?: number | undefined;
  lastLoginTime?: string | undefined;
  oftenVisitTime?: string | undefined;
  job?: string | undefined;
  looks?: string | undefined;
  holidays?: string | undefined;
  hometown?: string | undefined;
  bloodType?: string | undefined;
  housemate?: string | undefined;
  smokingStatus?: string | undefined;
  alcohol?: string | undefined;
  constellation?: string | undefined;
  bustSize?: string | undefined;
  hLevel?: string | undefined;
};

export type BoardListUserInfo = {
  userName: string;
  userId: string;
  age: number;
  region: Region;
  avatarId: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  message: string;
  postTime: string;
  isCalling: boolean;
  liveCallType?: LiveCallType;
  hasLovense: boolean;
  hLevel?: string;
  bustSize?: string;
  isNewUser: boolean;
  regDate?: string;
  isOnline: boolean;
  // 配信中ユーザーの即時入室用情報
  channelInfo?: BoardChannelInfo;
  broadcasterInfo?: BoardBroadcasterInfo;
};

export type PointInfo = {
  isPurchased: boolean;
  point: number;
};
