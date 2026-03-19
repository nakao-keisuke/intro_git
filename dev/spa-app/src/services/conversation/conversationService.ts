import { getServerSession } from 'next-auth';
import type { ConversationMoreRouteResponse } from '@/apis/http/conversationMore';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import {
  DELETE_CONVERSATION,
  HTTP_GET_CONVERSATION_MORE,
} from '@/constants/endpoints';
import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { ListConversationType } from '@/types/ListConversationType';
import { lastMessage } from '@/utils/messageUtil';
import { region as regionName } from '@/utils/region';
import type {
  ConversationListRequest,
  ConversationListResponse,
  ConversationMessage,
  DeleteConversationApiResponse,
  DeleteConversationResponse,
} from './type';

// Service Interface
export interface ConversationService {
  getConversations: (
    listType: ListConversationType,
    timeStamp?: string,
  ) => Promise<ConversationListResponse>;
  deleteConversations: (
    partnerIds: string[],
  ) => Promise<DeleteConversationResponse>;
  deleteAllConversations: () => Promise<DeleteConversationResponse>;
}

// Server実装
export class ServerConversationService implements ConversationService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getConversations(
    listType: ListConversationType,
    timeStamp?: string,
  ): Promise<ConversationListResponse> {
    const session = await getServerSession(authOptions);

    const request: ConversationListRequest = {
      api: JAMBO_API_ROUTE.LIST_CONVERSATION,
      token: session?.user?.token || '',
      take: 15,
      time_stamp: timeStamp || null,
      unread_only: false,
      conversating_only: listType === 'conversation',
      bookmark_only: listType === 'bookmark',
    };

    // ライブチャンネル情報はポーリングで取得済みのため、会話リストのみ取得
    const response = await this.client.post<APIResponse<ServerRawMessage[]>>(
      this.apiUrl,
      request,
      { cache: 'no-store' },
    );

    if (response.code !== 0 || !response.data) {
      return {
        messages: [],
        hasMore: false,
      };
    }

    // region フィールドを正規化して ConversationMessage に変換
    const messages: ConversationMessage[] = response.data.map((rawMessage) => {
      return normalizeMessage(rawMessage);
    });

    // データが1件以上あれば「さらに取得可能」と判断しtrueを返す。
    // データが0件の場合は「さらに取得不可」と判断しfalseを返す。
    const hasMore = !timeStamp ? messages.length > 0 : true;
    return {
      messages,
      hasMore,
    };
  }

  async deleteConversations(
    _partnerIds: string[],
  ): Promise<DeleteConversationResponse> {
    // Server側ではNext.js APIルート経由で処理
    throw new Error(
      'deleteConversations is not available on server side. Use client service.',
    );
  }

  async deleteAllConversations(): Promise<DeleteConversationResponse> {
    // Server側ではNext.js APIルート経由で処理
    throw new Error(
      'deleteAllConversations is not available on server side. Use client service.',
    );
  }
}

// Client実装
export class ClientConversationService implements ConversationService {
  constructor(private readonly client: HttpClient) {}

  async getConversations(
    listType: ListConversationType,
    timeStamp?: string,
  ): Promise<ConversationListResponse> {
    // Next.js APIルート経由（ライブチャンネル情報はポーリングで取得済み）
    const response = await this.client.post<ConversationMoreRouteResponse>(
      HTTP_GET_CONVERSATION_MORE,
      {
        listType,
        timeStamp,
        take: 15,
      },
    );

    // ApiRouteResponse形式のレスポンスから成功時のdataを抽出
    if (response.type === 'success' && response.data) {
      const hasMore = true;
      return {
        messages: response.data,
        hasMore,
      };
    }

    // エラー時は空配列を返す
    return {
      messages: [],
      hasMore: false,
    };
  }

  async deleteConversations(
    partnerIds: string[],
  ): Promise<DeleteConversationResponse> {
    // クライアントからNext.js APIルートを経由してJambo APIを呼び出す
    const response = await this.client.post<DeleteConversationApiResponse>(
      DELETE_CONVERSATION,
      {
        partnerIds,
      },
    );

    return { success: response.type === 'success' };
  }

  async deleteAllConversations(): Promise<DeleteConversationResponse> {
    // クライアントからNext.js APIルートを経由してJambo APIを呼び出す
    const response = await this.client.post<DeleteConversationApiResponse>(
      DELETE_CONVERSATION,
      {
        deleteAll: true,
      },
    );

    return { success: response.type === 'success' };
  }
}

/**
 * サーバーから取得したメッセージの region フィールドを正規化する
 * 数値コードの場合は名称に変換し、文字列の場合はトリムする
 */
type ServerRawMessage = Omit<ConversationMessage, 'region'> & {
  region: number | string;
};

function normalizeMessage(rawMessage: ServerRawMessage): ConversationMessage {
  const region =
    typeof rawMessage.region === 'number'
      ? regionName(rawMessage.region)
      : typeof rawMessage.region === 'string'
        ? rawMessage.region.trim()
        : '';

  const formattedLastMsg = lastMessage(
    rawMessage.msgType ?? '',
    rawMessage.lastMsg ?? '',
    rawMessage.isOwn ?? false,
  );

  return {
    ...rawMessage,
    region,
    lastMsg: formattedLastMsg,
    unreadNum: rawMessage.unreadNum ?? 0,
    voiceCallWaiting: rawMessage.voiceCallWaiting ?? false,
    videoCallWaiting: rawMessage.videoCallWaiting ?? false,
    isNewUser: rawMessage.isNewUser ?? false,
    hasLovense: rawMessage.hasLovense ?? false,
    isListedOnFleaMarket: rawMessage.isListedOnFleaMarket ?? false,
    gender: rawMessage.gender ?? 0,
  };
}

// Factory関数
export function createConversationService(
  client: HttpClient,
): ConversationService {
  if (client.getContext() === Context.SERVER) {
    return new ServerConversationService(client);
  } else {
    return new ClientConversationService(client);
  }
}
