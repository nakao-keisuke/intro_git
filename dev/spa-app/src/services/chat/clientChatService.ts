import type {
  GetMoreTextMessagesRequest,
  GetMoreTextMessagesResponse,
} from '@/apis/http/message';
import { GET_CHAT_HISTORY, HTTP_GET_TEXT } from '@/constants/endpoints';
import { CLIENT_API_TIMEOUT_MS, type HttpClient } from '@/libs/http/HttpClient';
import type {
  GetChatHistoryRequest,
  GetChatHistoryResponse,
  GetMoreChatHistoryResponse,
} from './type';

// Service Interface
export interface ChatService {
  getChatHistory: (partnerId: string) => Promise<GetChatHistoryResponse>;
  getMoreChatHistory: (
    partnerId: string,
    timeStamp: string,
  ) => Promise<GetMoreChatHistoryResponse>;
}

// Client実装（ブラウザ用）
export class ClientChatService implements ChatService {
  constructor(private readonly client: HttpClient) {}

  async getChatHistory(partnerId: string): Promise<GetChatHistoryResponse> {
    const request: GetChatHistoryRequest = {
      partnerId,
    };

    return this.client.post<GetChatHistoryResponse>(GET_CHAT_HISTORY, request, {
      timeoutMs: CLIENT_API_TIMEOUT_MS,
    });
  }

  async getMoreChatHistory(
    partnerId: string,
    timeStamp: string,
  ): Promise<GetMoreChatHistoryResponse> {
    const request: GetMoreTextMessagesRequest = {
      partnerId,
      timeStamp,
    };

    const response = await this.client.post<GetMoreTextMessagesResponse>(
      HTTP_GET_TEXT,
      request,
      { timeoutMs: CLIENT_API_TIMEOUT_MS },
    );

    // GetMoreTextMessagesResponse を GetMoreChatHistoryResponse に変換
    if (response.type === 'error') {
      return response;
    }

    return response.data ?? [];
  }
}
