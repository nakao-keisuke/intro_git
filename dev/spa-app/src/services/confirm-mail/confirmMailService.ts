import {
  type ValidateConfirmRegisterEmailForUtageWebResponseData,
  validateConfirmRegisterEmailForUtageWebRequest,
} from '@/apis/validate-confirm-register-email-for-utage-web';
import { decrypt } from '@/libs/crypto';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';
import type { ConfirmMailResult } from './type';

export interface ConfirmMailService {
  validateEmail(token: string): Promise<ConfirmMailResult>;
}

export class ServerConfirmMailService implements ConfirmMailService {
  private readonly apiUrl: string = import.meta.env.API_URL!;

  constructor(private readonly client: HttpClient) {}

  async validateEmail(token: string): Promise<ConfirmMailResult> {
    try {
      const decryptedToken = decrypt(token);
      const { userId, email, type } = JSON.parse(decryptedToken) as {
        userId: string;
        email: string;
        type?: 'register' | 'change';
      };

      const request = validateConfirmRegisterEmailForUtageWebRequest(
        userId,
        email,
      );
      const response = await this.client.post<
        APIResponse<ValidateConfirmRegisterEmailForUtageWebResponseData>
      >(this.apiUrl, request);

      const { code, data } = response;
      if (code) {
        let message = '';
        switch (code) {
          case 12:
            message = 'メールアドレスがすでに使用されています';
            break;
          default:
            message = 'サーバーの不明なエラーです';
            break;
        }
        return { type: 'error', message };
      }

      // 新規登録の場合、dataがなくても処理を続ける
      if (!data && type !== 'register') {
        return {
          type: 'error',
          message: 'データが取得できませんでした',
        };
      }

      // ステータスを決定:
      // 1. メール変更の場合は always 'already_registered'
      // 2. 新規登録の場合は、dataがあればその値を使用、なければ 'unconfirmed'
      const status =
        type === 'change'
          ? 'already_registered'
          : data?.email_status || 'unconfirmed';

      return {
        type: 'success',
        email: data?.email || email, // dataがない場合はトークンのemailを使用
        status: status,
      };
    } catch (_e) {
      return {
        type: 'error',
        message:
          'アクセスURLをお確かめください。何度もエラーが発生する場合はお問い合わせください',
      };
    }
  }
}

export class ClientConfirmMailService implements ConfirmMailService {
  constructor(readonly _client: HttpClient) {}

  async validateEmail(_token: string): Promise<ConfirmMailResult> {
    // Client side doesn't need to validate email - this is done on server
    throw new Error('validateEmail should not be called on client side');
  }
}

export function createConfirmMailService(
  client: HttpClient,
): ConfirmMailService {
  if (client.getContext() === Context.SERVER) {
    return new ServerConfirmMailService(client);
  } else {
    return new ClientConfirmMailService(client);
  }
}
