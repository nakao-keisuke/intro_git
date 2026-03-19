import { getServerSession } from 'next-auth';
import {
  type GetUtageWebPointInfoResponseData,
  getUtageWebPointInfoRequest,
} from '@/apis/get-utage-web-point-info';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { SettingInitialData } from './type';

export interface SettingService {
  getInitialData: () => Promise<SettingInitialData>;
}

export class ServerSettingService implements SettingService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<SettingInitialData> {
    try {
      const { authOptions } = await import(
        '@/app/api/auth/[...nextauth]/options'
      );
      const session = await getServerSession(authOptions);
      const token = session?.user?.token;

      if (!token) {
        return {
          isPurchased: false,
          consumedPoint: 0,
        };
      }

      const pointInfoRequest = getUtageWebPointInfoRequest(token);
      const { code, data } = await this.client.post<
        APIResponse<GetUtageWebPointInfoResponseData>
      >(this.apiUrl, pointInfoRequest);

      // APIエラーの場合はフォールバック値を返す
      if (code !== 0) {
        console.warn('Point info API error:', code);
        return {
          isPurchased: false,
          consumedPoint: 0,
        };
      }

      return {
        isPurchased: !!data?.is_purchased,
        consumedPoint: data?.point || 0,
      };
    } catch (error) {
      console.error('SettingService getInitialData error:', error);
      // エラーが発生した場合はフォールバック値を返す
      return {
        isPurchased: false,
        consumedPoint: 0,
      };
    }
  }
}

export class ClientSettingService implements SettingService {
  constructor(readonly _client: HttpClient) {}

  async getInitialData(): Promise<SettingInitialData> {
    // Client側では初期データは不要（モーダルでのみ使用）
    return {
      isPurchased: false,
      consumedPoint: 0,
    };
  }
}

export function createSettingService(client: HttpClient): SettingService {
  if (client.getContext() === Context.SERVER) {
    return new ServerSettingService(client);
  } else {
    return new ClientSettingService(client);
  }
}
