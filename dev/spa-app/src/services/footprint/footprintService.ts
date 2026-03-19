import { getServerSession } from 'next-auth';
import { getFooterPrintHistoryRequest } from '@/apis/get-foot-print-list';
import { lstFavRequest } from '@/apis/lst-fav';
import { GET_MORE_FOOTPRINTS } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { region } from '@/utils/region';
import type {
  FavoriteAPIResponse,
  FootprintAPIResponse,
  FootprintListResponse,
  FootprintListUserInfo,
  FootprintListWithPaginationResponse,
} from './type';

export interface FootprintService {
  getInitialData: () => Promise<FootprintListResponse>;
  getMoreData?: (
    skip: number,
    take?: number,
  ) => Promise<APIResponse<FootprintListWithPaginationResponse>>;
}

export class ServerFootprintService implements FootprintService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<FootprintListResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      throw new Error('Unauthorized');
    }
    // 足跡履歴とお気に入り一覧取得
    const footprintRequest = getFooterPrintHistoryRequest(token);
    const myFavoriteRequest = lstFavRequest(token);

    const [
      { code: footprintCode, data: footprintData },
      { code: favCode, data: favData },
    ] = await Promise.all([
      this.client.post<{ code: number; data: FootprintAPIResponse[] }>(
        this.apiUrl,
        footprintRequest,
      ),
      this.client.post<{ code: number; data: FavoriteAPIResponse[] }>(
        this.apiUrl,
        myFavoriteRequest,
      ),
    ]);

    // 足跡履歴とお気に入り一覧取得のエラーチェック
    if (footprintCode || favCode) {
      throw new Error('Error fetching footprint data');
    }

    // 足あとリストからユーザーIDを取得
    const favList =
      favData?.map((data: FavoriteAPIResponse) => data.userId) ?? [];

    const list =
      footprintData?.map((data: FootprintAPIResponse) => ({
        userId: data.userId,
        avatarId: data.avaId,
        videoCallWaiting: data.videoCallWaiting ?? false,
        voiceCallWaiting: data.voiceCallWaiting ?? false,
        about: data.abt ?? '',
        age: data.age,
        region: region(data.region),
        userName: data.userName,
        lastLoginTime: data.lastLogin ?? '202401010000',
        checkTime: data.chkTime,
        isFavorited: favList.includes(data.userId),
        bustSize: data?.bustSize || '',
        hLevel: data?.hLevel || '',
        isNewUser: data?.isNewUser ?? false,
        timeStamp: data.chkTime, // Use checkTime as timeStamp for infinite scroll
      })) ?? [];

    return { list };
  }

  async getMoreData(
    skip: number,
    take: number = 30,
  ): Promise<APIResponse<FootprintListWithPaginationResponse>> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return {
        code: 401,
        data: {
          list: [],
          hasMore: false,
        },
      };
    }
    const footprintRequest = getFooterPrintHistoryRequest(token, skip, take);
    const myFavoriteRequest = lstFavRequest(token);

    const [
      { code: footprintCode, data: footprintData },
      { code: favCode, data: favData },
    ] = await Promise.all([
      this.client.post<{ code: number; data: FootprintAPIResponse[] }>(
        this.apiUrl,
        footprintRequest,
      ),
      this.client.post<{ code: number; data: FavoriteAPIResponse[] }>(
        this.apiUrl,
        myFavoriteRequest,
      ),
    ]);

    if (footprintCode || favCode) {
      return {
        code: footprintCode || favCode || 1,
        data: {
          list: [],
          hasMore: false,
        },
      };
    }

    const favList =
      favData?.map((data: FavoriteAPIResponse) => data.userId) ?? [];

    const list: FootprintListUserInfo[] = (footprintData ?? []).map(
      (data: FootprintAPIResponse) => ({
        userId: data.userId,
        avatarId: data.avaId,
        videoCallWaiting: data.videoCallWaiting ?? false,
        voiceCallWaiting: data.voiceCallWaiting ?? false,
        about: data.abt ?? '',
        age: data.age,
        region: region(data.region),
        userName: data.userName,
        lastLoginTime: data.lastLogin ?? '202401010000',
        checkTime: data.chkTime,
        isFavorited: favList.includes(data.userId),
        bustSize: data?.bustSize || '',
        hLevel: data?.hLevel || '',
        isNewUser: data?.isNewUser ?? false,
        timeStamp: data.chkTime,
      }),
    );

    return {
      code: 0,
      data: {
        list,
        hasMore: list.length === take,
      },
    };
  }
}

export class ClientFootprintService implements FootprintService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<FootprintListResponse> {
    // Client側では初期データ取得は基本的に行わない
    // 必要に応じて専用のAPIエンドポイントを作成
    throw new Error('Client-side getInitialData is not implemented');
  }

  async getMoreData(
    skip: number,
    _take?: number,
  ): Promise<APIResponse<FootprintListWithPaginationResponse>> {
    // セッションの有効性を確認
    const { getSession } = await import('next-auth/react');
    const session = await getSession();

    if (!session?.user.token) {
      return {
        code: 401,
        data: {
          list: [],
          hasMore: false,
        },
      };
    }

    const response =
      await this.client.post<FootprintListWithPaginationResponse>(
        GET_MORE_FOOTPRINTS,
        { skip },
      );

    if (!response) {
      throw new Error('No data received from server');
    }

    return {
      code: 0,
      data: {
        list: response.list,
        hasMore: response.hasMore,
      },
    };
  }
}

export function createFootprintService(client: HttpClient): FootprintService {
  if (client.getContext() === Context.SERVER) {
    return new ServerFootprintService(client);
  } else {
    return new ClientFootprintService(client);
  }
}
