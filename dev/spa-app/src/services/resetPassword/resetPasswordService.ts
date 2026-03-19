import { resetPwdForWebRequest } from '@/apis/reset-pwd-for-web';
import { verifyPasswordResetAuthCode } from '@/apis/verify-password-reset-auth-code';
import { HTTP_RESET_PASSWORD_FOR_WEB } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type {
  ResetPasswordAPIResponse,
  ResetPasswordRequest,
  VerifyAuthCodeParams,
  VerifyAuthCodeResult,
} from './type';

export interface ResetPasswordService {
  resetPassword: (
    userId: string,
    newPassword: string,
    originalPassword: string,
  ) => Promise<APIResponse<null>>;
  verifyAuthCode: (
    params: VerifyAuthCodeParams,
  ) => Promise<VerifyAuthCodeResult>;
}

export class ServerResetPasswordService implements ResetPasswordService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async verifyAuthCode(
    params: VerifyAuthCodeParams,
  ): Promise<VerifyAuthCodeResult> {
    const { authCode, userId } = params;

    try {
      const request = verifyPasswordResetAuthCode(authCode);
      const response = await this.client.post<APIResponse<null>>(
        this.apiUrl,
        request,
      );

      if (response.code !== 0) {
        return {
          isVerified: false,
          authCode,
          userId,
          error: '認証コードが無効です。もう一度お試しください。',
        };
      }

      return {
        isVerified: true,
        authCode,
        userId,
      };
    } catch (_error) {
      return {
        isVerified: false,
        authCode,
        userId,
        error: 'サーバーエラーが発生しました。もう一度お試しください。',
      };
    }
  }

  async resetPassword(
    userId: string,
    newPassword: string,
    originalPassword: string,
  ): Promise<APIResponse<null>> {
    const request = resetPwdForWebRequest(
      userId,
      newPassword,
      originalPassword,
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

export class ClientResetPasswordService implements ResetPasswordService {
  constructor(private readonly client: HttpClient) {}

  async verifyAuthCode(
    params: VerifyAuthCodeParams,
  ): Promise<VerifyAuthCodeResult> {
    // クライアントサイドでは認証コード検証はサーバーサイドで完了しているため、
    // 渡されたパラメータをそのまま返す
    return {
      isVerified: true,
      authCode: params.authCode,
      userId: params.userId,
    };
  }

  async resetPassword(
    userId: string,
    newPassword: string,
    originalPassword: string,
  ): Promise<APIResponse<null>> {
    const request: ResetPasswordRequest = {
      fromUserId: userId,
      newPassword,
      originalPassword,
    };

    try {
      const response = await this.client.post<ResetPasswordAPIResponse>(
        HTTP_RESET_PASSWORD_FOR_WEB,
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

export function createResetPasswordService(
  client: HttpClient,
): ResetPasswordService {
  if (client.getContext() === Context.SERVER) {
    return new ServerResetPasswordService(client);
  } else {
    return new ClientResetPasswordService(client);
  }
}
