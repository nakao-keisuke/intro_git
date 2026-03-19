import { getServerSession } from 'next-auth';
import {
  type GetUserInfoResponseData,
  getUserInfoRequest,
} from '@/apis/get-user-inf';
import type { HttpClient } from '@/libs/http/HttpClient';
import type { APIResponse } from '@/libs/http/type';
import type { AlreadyRegisteredMailData } from './type';

export class AlreadyRegisteredMailService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getAlreadyRegisteredMailData(): Promise<AlreadyRegisteredMailData> {
    try {
      const { authOptions } = await import(
        '@/app/api/auth/[...nextauth]/options'
      );
      const session = await getServerSession(authOptions);
      const token = session?.user?.token;

      if (!token) {
        throw new Error('認証が必要です');
      }

      const userRequest = getUserInfoRequest(token);
      const { code, data } = await this.client.post<
        APIResponse<GetUserInfoResponseData>
      >(this.apiUrl, userRequest);

      if (code !== 0) {
        throw new Error('ユーザー情報の取得に失敗しました');
      }

      // セッションのメールアドレスと取得したメールアドレスが異なる場合
      if (session?.user.email !== data?.email) {
        throw new Error(
          'メールアドレスが変更されました。再ログインしてください',
        );
      }

      return {
        email: data.email ?? '',
      };
    } catch (error) {
      console.error('AlreadyRegisteredMailService error:', error);
      throw error;
    }
  }
}

export function createAlreadyRegisteredMailService(
  client: HttpClient,
): AlreadyRegisteredMailService {
  return new AlreadyRegisteredMailService(client);
}
