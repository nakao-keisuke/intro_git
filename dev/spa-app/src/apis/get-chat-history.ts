import type { JamboRequest } from '@/types/JamboApi';

interface GetChatHistoryRequest extends JamboRequest {
  readonly api: 'get_chat_history';
  readonly token: string;
  readonly frd_id: string;
  readonly time_stamp: string;
  readonly take: number;
}

// snake_case版（Jambo APIレスポンス用）
export interface GetChatHistoryResponseElementData {
  readonly msg_id: string;
  readonly msg_type: MsgType;
  readonly is_own: boolean;
  readonly read_time: string;
  readonly time_stamp: string;
  readonly content: string;
}

// camelCase版（ServerHttpClient経由のレスポンス用）
export interface GetChatHistoryResponseData {
  readonly msgId: string;
  readonly msgType: MsgType;
  readonly isOwn: boolean;
  readonly readTime: string;
  readonly timeStamp: string;
  readonly content: string;
}

const msgTypeList = ['FILE', 'ABSENCECALL', 'STK', 'PP'] as const;
export type MsgType = (typeof msgTypeList)[number];

export const getChatHistoryRequest = (
  token: string,
  partnerId: string,
): GetChatHistoryRequest => {
  return {
    api: 'get_chat_history',
    token: token,
    frd_id: partnerId,
    time_stamp: '',
    take: 20,
  };
};

export const getMoreChatHistoryRequest = (
  token: string,
  partnerId: string,
  timeStamp: string = '',
): GetChatHistoryRequest => {
  return {
    api: 'get_chat_history',
    token: token,
    frd_id: partnerId,
    time_stamp: timeStamp,
    take: 50,
  };
};
