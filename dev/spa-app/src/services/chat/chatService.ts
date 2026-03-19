import { getServerSession } from 'next-auth';
import {
  type GetChatFileArchiveResponseElementData,
  getChatFileArchiveRequest,
} from '@/apis/get-chat-file-archive-camel';
import {
  type GetChatHistoryResponseData,
  getChatHistoryRequest as getChatHistoryUpstreamRequest,
  getMoreChatHistoryRequest as getMoreChatHistoryUpstreamRequest,
} from '@/apis/get-chat-history';
import {
  type GetOpenedAudioResponseData,
  getOpenedAudioRequest,
} from '@/apis/get-opened-audio';
import { GET_CHAT_HISTORY, GET_MORE_CHAT_HISTORY } from '@/constants/endpoints';
import { CLIENT_API_TIMEOUT_MS, type HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { CreditPurchaseInfo } from '@/services/message/type';
import type { ChatInfo } from '@/types/ChatInfo';
import { convertToChatInfoFromCamelCase } from '@/utils/chat/convert';
import type {
  GetChatHistoryRequest,
  GetChatHistoryResponse,
  GetMoreChatHistoryRequest,
  GetMoreChatHistoryResponse,
} from './type';

// Service Interface
export interface ChatService {
  getChatHistory: (partnerId: string) => Promise<GetChatHistoryResponse>;
  getMoreChatHistory: (
    partnerId: string,
    timeStamp: string,
  ) => Promise<GetMoreChatHistoryResponse>;

  // 初期表示用の並列取得（SSR専用）
  getInitialChatData?: (partnerId: string) => Promise<{
    chatHistory: ChatInfo[];
    creditPurchaseInfo: CreditPurchaseInfo | null;
  }>;
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
    const request: GetMoreChatHistoryRequest = {
      partnerId,
      timeStamp,
    };

    return this.client.post<GetMoreChatHistoryResponse>(
      GET_MORE_CHAT_HISTORY,
      request,
      { timeoutMs: CLIENT_API_TIMEOUT_MS },
    );
  }
}

// Server実装
export class ServerChatService implements ChatService {
  constructor(private readonly client: HttpClient) {}

  async getChatHistory(partnerId: string): Promise<GetChatHistoryResponse> {
    return this.fetchChatHistoryWithMedia(partnerId);
  }

  async getMoreChatHistory(
    partnerId: string,
    timeStamp: string,
  ): Promise<GetMoreChatHistoryResponse> {
    return this.fetchChatHistoryWithMedia(partnerId, timeStamp);
  }

  /**
   * 初期表示用の並列取得（SSR専用）
   * chatHistoryとcreditPurchaseInfoを並列で取得
   */
  async getInitialChatData(partnerId: string): Promise<{
    chatHistory: ChatInfo[];
    creditPurchaseInfo: CreditPurchaseInfo | null;
  }> {
    const [chatHistoryResult, creditInfo] = await Promise.all([
      // チャット履歴取得
      (async () => {
        const res = await this.getChatHistory(partnerId);
        return Array.isArray(res) ? res : [];
      })(),

      // クレジット購入情報取得
      (async () => {
        try {
          const { authOptions } = await import(
            '@/app/api/auth/[...nextauth]/options'
          );
          const session = await getServerSession(authOptions);
          const token = session?.user?.token;

          if (!token) return null;

          const { createMessageService } = await import(
            '@/services/message/messageService'
          );
          const { serverHttpClient } = await import(
            '@/libs/http/ServerHttpClient'
          );
          const messageService = createMessageService(serverHttpClient);
          return await messageService.getCreditPurchaseInfo();
        } catch {
          return null;
        }
      })(),
    ]);

    return {
      chatHistory: chatHistoryResult,
      creditPurchaseInfo: creditInfo,
    };
  }

  /**
   * チャット履歴とメディア開封情報を取得する共通処理
   * @param partnerId パートナーID
   * @param timeStamp タイムスタンプ（省略時は初回取得）
   */
  private async fetchChatHistoryWithMedia(
    partnerId: string,
    timeStamp?: string,
  ): Promise<GetChatHistoryResponse | GetMoreChatHistoryResponse> {
    try {
      // セッションからトークンを取得
      const { authOptions } = await import(
        '@/app/api/auth/[...nextauth]/options'
      );
      const session = await getServerSession(authOptions);
      const token = session?.user?.token;

      if (!token) {
        return { type: 'error', message: 'ログインしていません' };
      }

      // timeStampの有無でリクエスト関数を切り替え
      const chatReq = timeStamp
        ? getMoreChatHistoryUpstreamRequest(token, partnerId, timeStamp)
        : getChatHistoryUpstreamRequest(token, partnerId);

      // 購入済みメディア情報を取得
      // - 動画・画像: get_chat_file_archive
      // - 音声: get_opened_audio（get_chat_file_archiveには音声が含まれないため）
      const fileArchiveReq = getChatFileArchiveRequest(token, partnerId);
      const audioReq = getOpenedAudioRequest(token);

      const apiUrl = import.meta.env.API_URL;
      if (!apiUrl)
        return { type: 'error', message: 'API_URL is not configured' };

      // 並列で取得（チャット履歴と購入済みメディア情報）
      const [
        { code: chatCode, data: chatData },
        { code: fileArchiveCode, data: fileArchiveData },
        { code: audioCode, data: audioData },
      ] = await Promise.all([
        this.client.post<APIResponse<GetChatHistoryResponseData[]>>(
          apiUrl,
          chatReq,
        ),
        this.client.post<APIResponse<GetChatFileArchiveResponseElementData>>(
          apiUrl,
          fileArchiveReq,
        ),
        this.client.post<APIResponse<GetOpenedAudioResponseData[]>>(
          apiUrl,
          audioReq,
        ),
      ]);

      if (chatCode || fileArchiveCode || audioCode) {
        return { type: 'error', message: 'メッセージ履歴の取得に失敗しました' };
      }

      // 購入済みメディアIDを抽出（動画・画像・音声すべて）
      const fileArchiveArray: GetChatFileArchiveResponseElementData =
        fileArchiveData ?? [];
      const purchasedFileIds = [
        // 動画・画像（get_chat_file_archive）
        ...fileArchiveArray
          .filter((item) => item.isPurchased)
          .map((item) => item.mediaId),
        // 音声（get_opened_audio）
        ...(audioData ?? []).map((d) => d.fileId),
      ].filter(Boolean) as readonly string[];

      const mapped = (chatData ?? [])
        .map((data: GetChatHistoryResponseData) =>
          convertToChatInfoFromCamelCase(data, purchasedFileIds),
        )
        .reverse(); // 古い→新しい順に並べ替え

      return mapped;
    } catch (_e) {
      return { type: 'error', message: 'サーバーエラーが発生しました' };
    }
  }
}

// Factory関数
export function createChatService(client: HttpClient): ChatService {
  if (client.getContext() === Context.SERVER) {
    return new ServerChatService(client);
  } else {
    return new ClientChatService(client);
  }
}
