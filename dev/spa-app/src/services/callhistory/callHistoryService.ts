import { getServerSession } from 'next-auth';
import { getCallHistoryRequest } from '@/apis/get-call-history-for-second-apps';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { region } from '@/utils/region';
import type {
  CallHistoryItem,
  CallHistoryItemCamel,
  CallHistoryListResponse,
} from './type';

export interface CallHistoryService {
  getInitialData: () => Promise<CallHistoryListResponse>;
  getMoreData?: (skip?: number) => Promise<CallHistoryListResponse>;
}

export class ServerCallHistoryService implements CallHistoryService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<CallHistoryListResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return {
        callHistoryList: [],
      };
    }

    try {
      const request = getCallHistoryRequest(token, 0);
      const response = await this.client
        .post<APIResponse<CallHistoryItemCamel[]>>(this.apiUrl, request)
        .catch(
          (err) =>
            ({ code: err?.code ?? 500, data: [] }) as APIResponse<
              CallHistoryItemCamel[]
            >,
        );
      if (response.code !== 0 || !response.data) {
        return {
          callHistoryList: [],
        };
      }

      const callHistoryList: CallHistoryItem[] = response.data.map(
        (item: CallHistoryItemCamel) => {
          return {
            start_time: item.startTime || '',
            partner_id: item.partnerId || '',
            call_type: item.callType || 'video',
            user: {
              gender: item.user?.gender || 0,
              last_login_time: item.user?.lastLoginTime || '',
              user_id: item.user?.userId || '',
              online_status: item.user?.onlineStatus || '',
              user_name: item.user?.userName || '',
              voice_call_waiting: item.user?.voiceCallWaiting || false,
              region: region(item.user?.region || 0),
              ava_id: item.user?.avaId || '',
              age: item.user?.age || 0,
              video_call_waiting: item.user?.videoCallWaiting || false,
            },
          };
        },
      );

      return {
        callHistoryList,
      };
    } catch (_error) {
      return {
        callHistoryList: [],
      };
    }
  }

  async getMoreData(_skip: number = 0): Promise<CallHistoryListResponse> {
    return {
      callHistoryList: [],
    };
  }
}

export class ClientCallHistoryService implements CallHistoryService {
  constructor(readonly _client: HttpClient) {}

  async getInitialData(): Promise<CallHistoryListResponse> {
    // Client側では基本的にServer Componentでデータを取得するため、
    // 空のレスポンスを返す（必要に応じて実装）
    return {
      callHistoryList: [],
    };
  }

  async getMoreData(_skip: number = 0): Promise<CallHistoryListResponse> {
    // 将来的にClient側での追加データ取得が必要な場合は、
    // 専用のAPIルートを作成して実装
    return {
      callHistoryList: [],
    };
  }
}

export function createCallHistoryService(
  client: HttpClient,
): CallHistoryService {
  if (client.getContext() === Context.SERVER) {
    return new ServerCallHistoryService(client);
  } else {
    return new ClientCallHistoryService(client);
  }
}
