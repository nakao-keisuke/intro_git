import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type VerifyPhoneAuthCodeRequest = JamboRequest & {
  readonly api: 'verify_phone_auth_code';
  readonly token?: string;
  readonly phone_number: string;
  readonly auth_code: string;
};

export type VerifyPhoneAuthCodeResponse = JamboResponseData & {};

export const VerifyPhoneAuthCodeRequest = (
  token: string | null,
  phoneNumber: string,
  authCode: string,
): VerifyPhoneAuthCodeRequest => ({
  api: 'verify_phone_auth_code',
  ...(token && { token }),
  phone_number: phoneNumber,
  auth_code: authCode,
});
