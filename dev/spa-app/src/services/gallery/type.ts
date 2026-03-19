// Gallery Service関連の型定義

export type GalleryUser = {
  userId: string;
  userName: string;
  avaId: string;
  age: number;
  abt?: string;
  isBlocked?: boolean;
  instantCallWaiting?: boolean;
  voice_call_waiting?: boolean;
  region?: number;
  videoCallWaiting?: boolean;
};

export type OpenedContent = {
  fileId: string;
  purchasedTime?: string;
  purchaserId?: string;
  authorId?: string;
};

export type UnOpenedContent = {
  fileId: string;
  views?: number;
  favorites?: number;
  sentDate?: string;
  duration?: number;
};

export type GalleryItemResponse = {
  favoriteGalleryList?: Array<{
    galleryUser: GalleryUser;
    openedContent: OpenedContent;
  }>;
  nonFavoriteGalleryList?: Array<{
    galleryUser: GalleryUser;
    openedContent: OpenedContent;
  }>;
};

export type UnOpenItemsResponse = {
  items?: Array<{
    user: GalleryUser;
    unopenedContent: UnOpenedContent;
  }>;
};

export type RankingUser = {
  userId: string;
  userName: string;
  avaId: string;
  age: number;
  abt: string;
  lastActionStatusColor: string;
  stepToCall: number;
  gender: number;
  lastLoginTime: string;
  isNew: boolean;
  lastActionStatusLabel: string;
  talkTheme: number;
  showingFaceStatus: number;
  lastActionStatusIndex: number;
  channelInfo: string | null;
  onlineStatusColor: string;
  callStatus: number;
  onlineStatusLabel: string;
  voiceCallWaiting: boolean;
  region: string | number;
  videoChatWaiting: boolean;
};

export type RankingItem = {
  isSuddenRise: boolean;
  userId: string;
  rank: number;
  point: number;
  user: Partial<RankingUser>;
};

export type RankingResponse = RankingItem[];

export type GalleryListUserInfo = {
  userId: string;
  fileId: string;
  isFavorite: boolean;
  userName: string;
  avatarId: string;
  age: number;
  duration?: number | undefined;
  abt?: string | undefined;
  views?: number | undefined;
  favorites?: number | undefined;
  sentDate?: string | undefined;
};

import type { Region } from '@/utils/region';

export type RankedMeetPerson = {
  is_sudden_rise: boolean;
  user_id: string;
  rank: number;
  last_action_status_color: string;
  step_to_call: number;
  gender: number;
  last_login_time: string;
  is_new: boolean;
  user_name: string;
  last_action_status_label: string;
  talk_theme: number;
  showing_face_status: number;
  last_action_status_index: number;
  channel_info: string;
  online_status_color: string;
  abt: string;
  call_status: number;
  online_status_label: string;
  voice_call_waiting: boolean;
  region: Region;
  ava_id: string;
  age: number;
  video_call_waiting: boolean;
  point: number;
  isSendRequest?: boolean;
};

export type GalleryData = {
  openMovies: GalleryListUserInfo[];
  openImages: GalleryListUserInfo[];
  unOpenMovies: GalleryListUserInfo[];
  unOpenImages: GalleryListUserInfo[];
  videoRankingList: RankedMeetPerson[];
  imageRankingList: RankedMeetPerson[];
};

export type PostBoardMessageRequest = {
  message: string;
};

export type PostBoardMessageResponse = {
  success: boolean;
};

// APIResponse用のデータ型（notEnoughPointフラグを含む）
export type PurchaseResponseData = {
  notEnoughPoint?: boolean;
};

export type RequestResponseData = {
  notEnoughPoint?: boolean;
};
// API レスポンスの生データ型定義（camelCase）
export type UnOpenItemsRawResponse = {
  user: {
    userId: string;
    userName: string;
    avaId: string;
    age: number;
    abt?: string;
  };
  unopenedContent: {
    fileId: string;
    views?: number;
    favorites?: number;
    sentDate?: string;
    duration?: number;
  };
};
