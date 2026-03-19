import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type SendPhoneAuthCodeRequest = JamboRequest & {
  readonly api: 'send_phone_auth_code';
  readonly phone_number: string;
};

export type SendPhoneAuthCodeResponse = JamboResponseData & {};

export const SendPhoneAuthCodeRequest = (
  phoneNumber: string,
): SendPhoneAuthCodeRequest => ({
  api: 'send_phone_auth_code',
  phone_number: phoneNumber,
});
