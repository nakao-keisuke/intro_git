import { getServerSession } from 'next-auth';
import {
  type CheckRegisterEmailStatusForUtageWebResponseData,
  checkRegisterEmailStatusForUtageWebRequest,
} from '@/apis/check-register-email-status-for-utage-web';
import { HTTP_SEND_CONFIRM_EMAIL } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type {
  CheckEmailStatusResponse,
  SendConfirmEmailRequest,
  SendConfirmEmailResponse,
} from './type';

export interface RegisterMailService {
  getEmailStatus?: (() => Promise<CheckEmailStatusResponse>) | undefined;
  sendConfirmEmail?:
    | ((email: string) => Promise<SendConfirmEmailResponse>)
    | undefined;
}

export class ServerRegisterMailService implements RegisterMailService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async getEmailStatus(): Promise<CheckEmailStatusResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      throw new Error('Unauthorized');
    }
    const request = checkRegisterEmailStatusForUtageWebRequest(token);
    const response = await this.client.post<
      APIResponse<CheckRegisterEmailStatusForUtageWebResponseData>
    >(this.apiUrl, request);

    if (response.code !== 0 || !response.data) {
      throw new Error('Failed to check email status');
    }

    const { email_status } = response.data;
    return {
      emailStatus: email_status,
      email: 'email' in response.data ? response.data.email : undefined,
    };
  }

  // Server側では実装しない（Client Componentで処理するため）
  sendConfirmEmail = undefined;
}

export class ClientRegisterMailService implements RegisterMailService {
  constructor(private readonly client: HttpClient) {}

  // Client側では実装しない（Server Componentで取得するため）
  getEmailStatus = undefined;

  async sendConfirmEmail(email: string): Promise<SendConfirmEmailResponse> {
    const request: SendConfirmEmailRequest = {
      email,
    };

    const response = await this.client.post<SendConfirmEmailResponse>(
      HTTP_SEND_CONFIRM_EMAIL,
      request,
    );

    return response;
  }
}

export function createRegisterMailService(
  client: HttpClient,
): RegisterMailService {
  if (client.getContext() === Context.SERVER) {
    return new ServerRegisterMailService(client);
  } else {
    return new ClientRegisterMailService(client);
  }
}
