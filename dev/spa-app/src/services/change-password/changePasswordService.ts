import { getServerSession } from 'next-auth';
import { HTTP_CHANGE_PASSWORD } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { Context } from '@/libs/http/type';
import type { ResponseData } from '@/types/NextApi';
import type {
  ChangePasswordData,
  ChangePasswordInitialData,
  ChangePasswordResponse,
} from './type';

export interface ChangePasswordService {
  getInitialData: () => Promise<ChangePasswordInitialData>;
  changePassword?: (
    data: ChangePasswordData,
  ) => Promise<ChangePasswordResponse>;
}

export class ServerChangePasswordService implements ChangePasswordService {
  constructor(readonly _client: HttpClient) {}

  async getInitialData(): Promise<ChangePasswordInitialData> {
    try {
      const { authOptions } = await import(
        '@/app/api/auth/[...nextauth]/options'
      );
      const session = await getServerSession(authOptions);

      if (!session?.user?.email?.includes('@')) {
        return {
          hasValidSession: false,
        };
      }

      return {
        hasValidSession: true,
        userEmail: session.user.email,
      };
    } catch (error) {
      console.error('ChangePasswordService getInitialData error:', error);
      return {
        hasValidSession: false,
      };
    }
  }
}

export class ClientChangePasswordService implements ChangePasswordService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<ChangePasswordInitialData> {
    // Client側では初期データは不要（useSessionで取得）
    return {
      hasValidSession: true,
    };
  }

  async changePassword(
    data: ChangePasswordData,
  ): Promise<ChangePasswordResponse> {
    try {
      const response = await this.client.post<ResponseData<{}>>(
        HTTP_CHANGE_PASSWORD,
        data,
      );

      if (response.type === 'error') {
        return {
          success: false,
          message: response.message || 'パスワード変更に失敗しました',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('ChangePassword error:', error);
      return {
        success: false,
        message: 'ネットワークエラーが発生しました',
      };
    }
  }
}

export function createChangePasswordService(
  client: HttpClient,
): ChangePasswordService {
  if (client.getContext() === Context.SERVER) {
    return new ServerChangePasswordService(client);
  } else {
    return new ClientChangePasswordService(client);
  }
}
