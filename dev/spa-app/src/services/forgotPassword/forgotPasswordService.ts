import { passwordResetRequest } from '@/apis/password-reset-request';
import { HTTP_PASSWORD_RESET_REQUEST } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import { isEmail } from '@/utils/validation';
import type { PasswordResetAPIResponse, PasswordResetRequest } from './type';

export interface ForgotPasswordService {
  sendPasswordResetLink: (emailOrPhone: string) => Promise<APIResponse<null>>;
}

export class ServerForgotPasswordService implements ForgotPasswordService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async sendPasswordResetLink(
    emailOrPhone: string,
  ): Promise<APIResponse<null>> {
    const isEmailAddress = isEmail(emailOrPhone);
    const request = passwordResetRequest(
      isEmailAddress ? undefined : emailOrPhone,
      isEmailAddress ? emailOrPhone : undefined,
    );

    try {
      const response = await this.client.post<APIResponse<null>>(
        this.apiUrl,
        request,
      );

      return response;
    } catch (_error) {
      return {
        code: 500,
        data: null,
      };
    }
  }
}

export class ClientForgotPasswordService implements ForgotPasswordService {
  constructor(private readonly client: HttpClient) {}

  async sendPasswordResetLink(
    emailOrPhone: string,
  ): Promise<APIResponse<null>> {
    const request: PasswordResetRequest = {
      emailOrPhone,
    };

    try {
      const response = await this.client.post<PasswordResetAPIResponse>(
        HTTP_PASSWORD_RESET_REQUEST,
        request,
      );

      // Pages Router APIからのレスポンス形式を変換
      if (response.type === 'success') {
        return {
          code: 0,
          data: null,
        };
      } else {
        return {
          code: 500,
          data: null,
        };
      }
    } catch (_error) {
      return {
        code: 500,
        data: null,
      };
    }
  }
}

export function createForgotPasswordService(
  client: HttpClient,
): ForgotPasswordService {
  if (client.getContext() === Context.SERVER) {
    return new ServerForgotPasswordService(client);
  } else {
    return new ClientForgotPasswordService(client);
  }
}
