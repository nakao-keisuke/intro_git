import type { ChannelInfo } from '@/types/ChannelInfo';
import type { MediaInfo } from '@/types/MediaInfo';
import type { PartnerInfo } from '@/types/PartnerInfo';
import type { OutgoingCallType } from '@/utils/callView';

export type CallType = 'video-call' | 'voice-call';

export type OutgoingCallData = {
  channelInfo: ChannelInfo;
  partnerInfo: PartnerInfo;
};

export type IncomingCallData = {
  channelInfo: Pick<ChannelInfo, 'userCount' | 'peerId'>;
  partnerInfo: PartnerInfo;
  thumbnailList: MediaInfo[];
  isBookmarked?: boolean;
  point?: number;
};

export type PartnerInfoResponse = {
  userId: string;
  userName: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  videoChatWaiting: boolean;
  point: number;
  avaId: string;
  region: number;
  age: number;
  abt: string | undefined;
  bdyTpe: number[];
  inters: number[];
  talkTheme: number;
  stepToCall: number;
  marriageHistory: number;
  showingFaceStatus: number;
  personalities: number[];
  lastLoginTimeFromUserCollection: string;
  regDate?: string;
  isFav: number;
  oftenVisitTime?: string;
  job?: string;
  looks?: string;
  holidays?: string;
  hometown?: string;
  bloodType?: string;
  housemate?: string;
  smokingStatus?: string;
  alcohol?: string;
  constellation?: string;
  bookmark: boolean;
  isNew: boolean;
  hasLovense?: boolean;
  bustSize?: string;
  hLevel?: string;
  applicationId: string;
};

export type MyUserInfoResponse = {
  gender: number;
  userId: string;
  userName: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  point: number;
  avaId: string;
  region: number;
  age: number;
  abt: string | undefined;
  bdyTpe: number[];
  inters: number[];
  talkTheme: number;
  stepToCall: number;
  marriageHistory: number;
  showingFaceStatus: number;
  personalities: number[];
  lastLoginTimeFromUserCollection: string;
  email?: string;
  regDate: string;
  bonusFlag: number;
  oftenVisitTime: string;
  applicationId?: string;
  paydoorRecurringToken?: string;
  bustSize?: string;
  hLevel?: string;
};
// Request types
export interface SendCallRequestRequest {
  partnerId: string;
  callType: OutgoingCallType;
}

// Response types
export interface SendCallRequestResponse {
  // APIは空のオブジェクトを返す
  type: string;
  message: string;
}
export interface PaySecondVideoCallPointResponse {
  readonly myPoint: { point: number };
  readonly broadcasterPoint: { point: number };
}

export interface GetCreditPurchaseCourseResponse {
  readonly isCreditPurchaseLogExist: boolean;
  readonly canBuyFirstBonusCourse: boolean;
  readonly canBuySecondBonusCourse: boolean;
  readonly canBuyThirdBonusCourse: boolean;
  readonly canBuyFourthBonusCourse: boolean;
}

// 通話終了通知関連
export interface EndedCallNotificationRequest {
  channelName: string;
  callType: 'voice' | 'video' | 'live';
  requestUserId: string;
  partnerUserId: string;
  duration: number;
}

export interface EndedCallNotificationResponse {
  type: 'success' | 'error';
  message?: string;
}

export const ENDED_CALL_NOTIFICATION_ERROR_MESSAGES = {
  SEND_FAILED: '通話終了通知の送信に失敗しました',
  UNKNOWN_ERROR: 'サーバーの不明なエラーです',
  EXCEPTION: '通話終了通知の送信中にエラーが発生しました',
} as const;
