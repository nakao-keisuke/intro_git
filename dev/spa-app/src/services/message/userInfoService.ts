import { GET_USER_INF_FOR_WEB_WITH_USER_ID } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { Context } from '@/libs/http/type';

// ユーザー情報リクエスト
export interface GetUserInfoRequest {
  myId: string;
  partnerId: string;
}

// ユーザー情報レスポンス
export interface GetUserInfoResponse {
  userId: string;
  userName: string;
  avatarId: string;
  age: number;
  region: string | number;
  hasLovense?: boolean;
  bookmark?: boolean;
  voiceCallWaiting?: boolean;
  videoCallWaiting?: boolean;
  about?: string;
  videoChatWaiting?: boolean;
  isListedOnFleaMarket?: boolean;
  bustSize?: string;
}

// Service Interface
export interface UserInfoService {
  getUserInfo: (
    myId: string,
    partnerId: string,
  ) => Promise<GetUserInfoResponse>;
}

// Client実装（ブラウザ用）
export class ClientUserInfoService implements UserInfoService {
  constructor(private readonly client: HttpClient) {}

  async getUserInfo(
    myId: string,
    partnerId: string,
  ): Promise<GetUserInfoResponse> {
    try {
      const request: GetUserInfoRequest = {
        myId,
        partnerId,
      };

      const response = await this.client.post<GetUserInfoResponse>(
        GET_USER_INF_FOR_WEB_WITH_USER_ID,
        request,
      );
      return response;
    } catch (error) {
      if (import.meta.env.NODE_ENV === 'development') {
        console.error('Failed to fetch user info:', error);
      }
      // 型安全な形でエラーオブジェクトをスロー
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('User info fetch failed');
    }
  }
}

// Server実装（必要に応じて実装）
export class ServerUserInfoService implements UserInfoService {
  constructor(readonly _client: HttpClient) {}

  async getUserInfo(
    _myId: string,
    _partnerId: string,
  ): Promise<GetUserInfoResponse> {
    // サーバー側での実装が必要な場合は、Server Componentから直接実行するか、
    // APIルートを経由してクライアントから呼び出すように実装してください
    throw new Error(
      'Server-side user info fetching is not implemented. Use Client Component or API Route instead.',
    );
  }
}

// Factory関数
export function createUserInfoService(client: HttpClient): UserInfoService {
  if (client.getContext() === Context.SERVER) {
    return new ServerUserInfoService(client);
  } else {
    return new ClientUserInfoService(client);
  }
}
