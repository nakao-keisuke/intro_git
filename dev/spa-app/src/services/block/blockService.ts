import { getServerSession } from 'next-auth';
import {
  type GetBlockListResponseData,
  getBlockListRequest,
} from '@/apis/get-block-list';
import { HTTP_REMOVE_BLOCK } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { ResponseData } from '@/types/NextApi';
import { region } from '@/utils/region';
import type { BlockListResponse, BlockListUserInfo } from './type';

export interface BlockService {
  getInitialData: () => Promise<BlockListResponse>;
  removeBlock?: (userId: string) => Promise<APIResponse<null>>;
}

export class ServerBlockService implements BlockService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<BlockListResponse> {
    try {
      // セッションからトークンを取得
      const { authOptions } = await import(
        '@/app/api/auth/[...nextauth]/options'
      );
      const session = await getServerSession(authOptions);
      const token = session?.user?.token;

      if (!token) {
        console.error('No authentication token found');
        return { blockList: [] };
      }

      const blockListReq = getBlockListRequest(token, 0, 100);

      // ServerHttpClient は camelCase へ変換するため、両方のキー形状を許容
      type BlockListItemResponse = Omit<
        GetBlockListResponseData,
        'user_id' | 'user_name' | 'ava_id'
      > & {
        userId?: string;
        userName?: string;
        avaId?: string;
      };

      // HttpClientを使用してAPI呼び出し
      const { code: blockListCode, data: blockListData } =
        await this.client.post<APIResponse<BlockListItemResponse[]>>(
          this.apiUrl,
          blockListReq,
        );

      if (blockListCode) {
        console.error('Block list API error:', blockListCode);
        return { blockList: [] };
      }

      const mappedData =
        blockListData?.map(
          (data: BlockListItemResponse | GetBlockListResponseData) => ({
            // camelCase / snake_case 両対応
            userId:
              ('userId' in data ? data.userId : undefined) ??
              ('user_id' in data ? data.user_id : undefined) ??
              '',
            avatarId:
              ('avaId' in data
                ? (data as BlockListItemResponse).avaId
                : undefined) ??
              ('ava_id' in data
                ? (data as GetBlockListResponseData).ava_id
                : undefined) ??
              '',
            userName:
              ('userName' in data
                ? (data as BlockListItemResponse).userName
                : undefined) ??
              ('user_name' in data
                ? (data as GetBlockListResponseData).user_name
                : undefined) ??
              '',
            region: region((data as { region: number }).region),
            voiceCallWaiting: false,
            videoCallWaiting: false,
          }),
        ) ?? ([] as BlockListUserInfo[]);

      return { blockList: mappedData };
    } catch (error) {
      console.error('Block list fetch failed:', error);
      return { blockList: [] };
    }
  }
}

export class ClientBlockService implements BlockService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<BlockListResponse> {
    // Client側では実装しない（Server Componentで取得）
    return { blockList: [] };
  }

  async removeBlock(userId: string): Promise<APIResponse<null>> {
    // Route Handler は ResponseData<null> を返すため、
    // 呼び出し側が期待する { code, message } 形式に正規化する
    const res = await this.client.post<ResponseData<null>>(HTTP_REMOVE_BLOCK, {
      partner_id: userId,
    });

    if (res.type !== 'error') {
      return { code: 0, message: 'OK' } as APIResponse<null>;
    }

    const errorCode =
      typeof res.code === 'number' ? res.code : res.code ? Number(res.code) : 1;
    return { code: errorCode, message: res.message } as APIResponse<null>;
  }
}

export function createBlockService(client: HttpClient): BlockService {
  if (client.getContext() === Context.SERVER) {
    return new ServerBlockService(client);
  } else {
    return new ClientBlockService(client);
  }
}
