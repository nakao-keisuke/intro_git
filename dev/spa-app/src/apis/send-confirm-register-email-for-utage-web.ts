import type { JamboRequest } from '@/types/JamboApi';

type SendConfirmRegisterEmailForUtageWebRequest = JamboRequest & {
  readonly api: 'send_confirm_register_email_for_utage_web';
  readonly token: string;
  readonly email: string;
  readonly confirm_email_token: string;
};

export type SendConfirmRegisterEmailForUtageWebResponseData = {};

export const sendConfirmRegisterEmailForUtageWebRequest = (
  token: string,
  email: string,
  authToken: string,
): SendConfirmRegisterEmailForUtageWebRequest => ({
  api: 'send_confirm_register_email_for_utage_web',
  token,
  email,
  confirm_email_token: authToken,
});
