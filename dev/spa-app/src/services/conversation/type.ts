import type { UtageWebGetLiveChannelsResponseData } from '@/apis/utage-web-get-live-channels';
import type { APIRequest } from '@/libs/http/type';
import type { LiveCallType } from '@/utils/callView';

export type LiveChannelListType = 'standby' | 'inLive';

export type ConversationListRequest = APIRequest & {
  token: string;
  take: 15;
  time_stamp: string | null;
  unread_only: boolean;
  conversating_only: boolean;
  bookmark_only: boolean;
};

export interface ConversationListResponse {
  messages: ConversationMessage[];
  hasMore: boolean;
}

// 統一されたConversationMessage型（キャメルケース）
export interface ConversationMessage {
  frdId: string;
  frdName: string;
  age?: number;
  region: string;
  isOnline: boolean;
  lastMsg: string;
  isOwn: boolean;
  sentTime: string;
  timeStamp: string;
  unreadNum: number;
  avaId: string;
  gender: 0 | 1 | 2;
  msgType?: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  oneBeforeMsgType?: string;
  isNewUser: boolean;
  hasLovense: boolean;
  isListedOnFleaMarket: boolean;
  liveCallType?: LiveCallType;
  liveChannelListType?: LiveChannelListType;
}

// 共通レスポンス
export type MarkAllReadResponse = { success: boolean };

// API payloads
export type GetLiveChannelsResponsePayload = {
  data: UtageWebGetLiveChannelsResponseData;
};
//Clientから取得したライブチャンネルリストデータの型
export type GetLiveChannelsResponsePayloadClient = {
  menuList: UtageWebGetLiveChannelsResponseData;
};

export type MarkReadsApiResponse = { type: string };

// 会話削除
export type DeleteConversationResponse = { success: boolean };
export type DeleteConversationApiResponse =
  | { type: 'success' }
  | { type: 'error'; message: string };
