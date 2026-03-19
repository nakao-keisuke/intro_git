import { NATIVE_CHANGE_EMAIL } from '@/constants/endpoints';
import type { HttpClient } from '@/libs/http/HttpClient';
import type { ChangeEmailParams, ChangeEmailResponse } from './type';

export interface NativeChangeEmailService {
  changeEmail: (params: ChangeEmailParams) => Promise<ChangeEmailResponse>;
}

export class ClientNativeChangeEmailService
  implements NativeChangeEmailService
{
  constructor(private readonly client: HttpClient) {}

  async changeEmail({
    email,
    password,
    applicationId,
  }: ChangeEmailParams): Promise<ChangeEmailResponse> {
    try {
      const response = await this.client.post<ChangeEmailResponse>(
        NATIVE_CHANGE_EMAIL,
        { email, password, applicationId },
      );
      return response;
    } catch (error) {
      console.error('Native change email error:', error);
      return {
        type: 'error',
        message: 'メールアドレスの変更に失敗しました',
      };
    }
  }
}

export function createNativeChangeEmailService(
  client: HttpClient,
): NativeChangeEmailService {
  return new ClientNativeChangeEmailService(client);
}
