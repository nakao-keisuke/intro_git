import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type ResendPhoneAuthCodeRequest = JamboRequest & {
  readonly api: 'resend_phone_auth_code';
  readonly phone_number: string;
};

export type ResendPhoneAuthCodeResponse = JamboResponseData & {};

export const ResendPhoneAuthCodeRequest = (
  phoneNumber: string,
): ResendPhoneAuthCodeRequest => ({
  api: 'resend_phone_auth_code',
  phone_number: phoneNumber,
});
