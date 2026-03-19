import type { Region } from '@/utils/region';

// API関連のデータ型定義

export interface RawRankingUser {
  userId?: string;
  user_id?: string;
  user?: {
    user_name?: string;
    userName?: string;
    ava_id?: string;
    avatarId?: string;
    avaId?: string;
    gender: number;
    last_login_time?: string;
    lastLoginTime?: string;
    abt?: string;
    about?: string;
    online_status_label?: string;
    onlineStatusLabel?: string;
    online_status_color?: string;
    onlineStatusColor?: string;
    last_action_status_label?: string;
    lastActionStatusLabel?: string;
    last_action_status_color?: string;
    lastActionStatusColor?: string;
    lank: number;
    age: number;
    voice_call_waiting?: boolean;
    voiceCallWaiting?: boolean;
    video_call_waiting?: boolean;
    videoCallWaiting?: boolean;
    is_new?: boolean;
    isNew?: boolean;
    region: number;
    rank?: number;
    channel_info?: {
      channel_id?: string;
      channel_owner_jambo_user_id?: string;
      channel_viewers?: number;
    };
    channelInfo?: {
      channelId?: string;
      channelOwnerJamboUserId?: string;
      channelViewers?: number;
    };
    call_status?: number;
    callStatus?: number;
    bust_size?: string;
    bustSize?: string;
    average_score?: number | null;
    averageScore?: number | null;
    review_count?: number;
    reviewCount?: number;
  };
  hasLovense?: boolean;
  has_lovense?: boolean;
  user_name?: string;
  userName?: string;
  ava_id?: string;
  avatarId?: string;
  avaId?: string;
  gender?: number;
  last_login_time?: string;
  lastLoginTime?: string;
  abt?: string;
  about?: string;
  online_status_label?: string;
  onlineStatusLabel?: string;
  online_status_color?: string;
  onlineStatusColor?: string;
  last_action_status_label?: string;
  lastActionStatusLabel?: string;
  last_action_status_color?: string;
  lastActionStatusColor?: string;
  lank?: number;
  age?: number;
  voice_call_waiting?: boolean;
  voiceCallWaiting?: boolean;
  video_call_waiting?: boolean;
  videoCallWaiting?: boolean;
  is_new?: boolean;
  isNew?: boolean;
  region?: number;
  rank?: number;
  channel_info?: {
    channel_id?: string;
    channel_owner_jambo_user_id?: string;
    channel_viewers?: number;
  };
  channelInfo?: {
    channelId?: string;
    channelOwnerJamboUserId?: string;
    channelViewers?: number;
  };
  call_status?: number;
  callStatus?: number;
  bust_size?: string;
  bustSize?: string;
  average_score?: number | null;
  averageScore?: number | null;
  review_count?: number;
  reviewCount?: number;
}

export interface InstantCallItem {
  user_id: string;
}

export interface RankedMeetPerson {
  userId: string;
  userName: string;
  avatarId: string;
  gender: number;
  lastLoginTime: string;
  about: string;
  onlineStatusLabel: string;
  onlineStatusColor: string;
  lastActionStatusLabel: string;
  lastActionStatusColor: string;
  lank: number;
  age: number;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  isNew: boolean;
  region: Region;
  rank: number | undefined;
  hasLovense: boolean;
  channelId: string | undefined;
  hasChannel: boolean;
  channelOwnerJamboUserId: string | undefined;
  channelViewers: number;
  callStatus: number;
  bustSize: string | undefined;
  averageScore: number | null;
  reviewCount: number;
}

export const CALL_STATUS = {
  NO_CALL: 0,
  STANDBY_VIDEO_CALL: 1,
  STANDBY_VIDEO_CHAT: 2,
  VIDEO_CHAT: 3,
} as const;

export type RankingType = 'videochat' | 'twoshot' | 'chat' | 'popular';

export interface RankingData {
  isAuthenticated: boolean;
  popularRankingMeetPeople: RankedMeetPerson[] | null;
  videochatRankingMeetPeople: RankedMeetPerson[] | null;
  twoshotRankingMeetPeople: RankedMeetPerson[] | null;
  chatRankingMeetPeople: RankedMeetPerson[] | null;
}

export interface RankingListRequest {
  type?: RankingType;
}

export interface RankingListResponse extends RankingData {}
