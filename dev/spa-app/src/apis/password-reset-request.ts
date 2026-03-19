import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type PasswordResetRequest = JamboRequest & {
  readonly api: 'password_reset_request';
  readonly phone_number?: string | undefined;
  readonly email?: string | undefined;
};

export type PasswordResetRequestResponseData = JamboResponseData & {};

// リクエスト作成関数
export const passwordResetRequest = (
  phone_number?: string,
  email?: string,
): PasswordResetRequest => {
  if (!phone_number && !email) {
    throw new Error('Either phone_number or email must be provided');
  }
  return {
    api: 'password_reset_request',
    phone_number: phone_number,
    email: email,
  };
};
