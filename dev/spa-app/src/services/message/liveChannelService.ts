import { GET_LIVE_USERS } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { Context } from '@/libs/http/type';
import type { LiveChannels } from '../shared/type';

// Service Interface
export interface LiveChannelService {
  getLiveChannels: (token: string) => Promise<LiveChannels>;
}

// Client実装（ブラウザ用）
export class ClientLiveChannelService implements LiveChannelService {
  constructor(private readonly client: HttpClient) {}

  async getLiveChannels(token: string): Promise<LiveChannels> {
    try {
      // APIエンドポイントは{ data: LiveChannels }を返す
      const response = await this.client.post<{ data: LiveChannels }>(
        GET_LIVE_USERS,
        { token },
      );
      return response.data;
    } catch (error) {
      if (import.meta.env.NODE_ENV === 'development') {
        console.error('Failed to fetch live channels:', error);
      }
      // エラーの場合は空のリストを返す
      return {
        inLiveList: [],
        standbyList: [],
      };
    }
  }
}

// Server実装（必要に応じて実装）
export class ServerLiveChannelService implements LiveChannelService {
  constructor(readonly _client: HttpClient) {}

  async getLiveChannels(_token: string): Promise<LiveChannels> {
    // サーバー側での実装が必要な場合は、Server Componentから直接実行するか、
    // APIルートを経由してクライアントから呼び出すように実装してください
    throw new Error(
      'Server-side live channel fetching is not implemented. Use Client Component or API Route instead.',
    );
  }
}

// Factory関数
export function createLiveChannelService(
  client: HttpClient,
): LiveChannelService {
  if (client.getContext() === Context.SERVER) {
    return new ServerLiveChannelService(client);
  } else {
    return new ClientLiveChannelService(client);
  }
}
