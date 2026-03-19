import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type VerifyPasswordResetAuthCodeRequest = JamboRequest & {
  readonly api: 'verify_password_reset_auth_code';
  readonly auth_code: string;
};

export type VerifyPasswordResetAuthCodeResponseData = JamboResponseData & {};

export const verifyPasswordResetAuthCode = (
  auth_code: string,
): VerifyPasswordResetAuthCodeRequest => ({
  api: 'verify_password_reset_auth_code',
  auth_code,
});
