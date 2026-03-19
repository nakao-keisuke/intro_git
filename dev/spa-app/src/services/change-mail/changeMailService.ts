import { getServerSession } from 'next-auth';
import {
  type CheckRegisterEmailStatusForUtageWebResponseData,
  checkRegisterEmailStatusForUtageWebRequest,
} from '@/apis/check-register-email-status-for-utage-web';
import { HTTP_SEND_CONFIRM_EMAIL } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { ResponseData } from '@/types/NextApi';
import type {
  ChangeMailInitialData,
  SendConfirmEmailData,
  SendConfirmEmailResponse,
} from './type';

export interface ChangeMailService {
  getInitialData: () => Promise<ChangeMailInitialData>;
  sendConfirmEmail?: (
    data: SendConfirmEmailData,
  ) => Promise<SendConfirmEmailResponse>;
}

export class ServerChangeMailService implements ChangeMailService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<ChangeMailInitialData> {
    try {
      const { authOptions } = await import(
        '@/app/api/auth/[...nextauth]/options'
      );
      const session = await getServerSession(authOptions);
      const token = session?.user?.token;

      if (!token) {
        throw new Error('認証が必要です');
      }

      const checkRegisteredEmailStatusRequest =
        checkRegisterEmailStatusForUtageWebRequest(token);
      const { code, data } = await this.client.post<
        APIResponse<CheckRegisterEmailStatusForUtageWebResponseData>
      >(this.apiUrl, checkRegisteredEmailStatusRequest);

      if (code !== 0 || !data) {
        throw new Error('サーバーの不明なエラーです');
      }

      if (data.email_status === 'unconfirmed' && 'email' in data) {
        return {
          emailStatus: 'unconfirmed',
          unconfirmedMail: data.email,
        };
      }

      return {
        emailStatus:
          data.email_status === 'already_registered'
            ? 'alreadyRegistered'
            : 'notRegistered',
      };
    } catch (error) {
      console.error('ChangeMailService getInitialData error:', error);
      throw error;
    }
  }
}

export class ClientChangeMailService implements ChangeMailService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<ChangeMailInitialData> {
    // Client側では初期データは不要
    return {
      emailStatus: 'notRegistered',
    };
  }

  async sendConfirmEmail(
    data: SendConfirmEmailData,
  ): Promise<SendConfirmEmailResponse> {
    try {
      const response = await this.client.post<ResponseData<{}>>(
        HTTP_SEND_CONFIRM_EMAIL,
        { ...data, type: 'change' },
      );

      if (response.type === 'error') {
        return {
          success: false,
          message: response.message || 'エラーが発生しました',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('SendConfirmEmail error:', error);
      return {
        success: false,
        message: 'ネットワークエラーが発生しました',
      };
    }
  }
}

export function createChangeMailService(client: HttpClient): ChangeMailService {
  if (client.getContext() === Context.SERVER) {
    return new ServerChangeMailService(client);
  } else {
    return new ClientChangeMailService(client);
  }
}
