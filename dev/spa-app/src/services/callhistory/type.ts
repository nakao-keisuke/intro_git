import type { Region } from '@/utils/region';

export interface CallHistoryUser {
  readonly gender: number;
  readonly last_login_time: string;
  readonly user_id: string;
  readonly online_status: string;
  readonly user_name: string;
  readonly voice_call_waiting: boolean;
  readonly region: Region;
  readonly ava_id: string;
  readonly age: number;
  readonly video_call_waiting: boolean;
}

export interface CallHistoryItem {
  readonly start_time: string;
  readonly partner_id: string;
  readonly call_type: 'live' | 'side_watch' | 'video' | 'voice';
  readonly user: CallHistoryUser;
}

// camelCase変換後のAPI responseの型定義
export interface CallHistoryUserCamel {
  readonly gender: number;
  readonly lastLoginTime: string;
  readonly userId: string;
  readonly onlineStatus: string;
  readonly userName: string;
  readonly voiceCallWaiting: boolean;
  readonly region: number;
  readonly avaId: string;
  readonly age: number;
  readonly videoCallWaiting: boolean;
}

export interface CallHistoryItemCamel {
  readonly startTime: string;
  readonly partnerId: string;
  readonly callType: 'live' | 'side_watch' | 'video' | 'voice';
  readonly user: CallHistoryUserCamel;
}

export interface CallHistoryListRequest {
  readonly skip?: number;
}

export interface CallHistoryListResponse {
  readonly callHistoryList: CallHistoryItem[];
}
