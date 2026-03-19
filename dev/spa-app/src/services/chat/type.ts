import type { ChatInfo } from '@/types/ChatInfo';
import type { ResponseData } from '@/types/NextApi';

export interface GetChatHistoryRequest {
  partnerId: string;
}

export interface GetMoreChatHistoryRequest {
  partnerId: string;
  timeStamp: string;
}

export type GetChatHistoryResponse = ResponseData<ChatInfo[]>;
export type GetMoreChatHistoryResponse = ResponseData<ChatInfo[]>;
