import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type ValidateConfirmRegisterEmailForUtageWebRequest = JamboRequest & {
  readonly api: 'validate_confirm_register_email_for_utage_web';
  readonly user_id: string;
  readonly email: string;
};

export type ValidateConfirmRegisterEmailForUtageWebResponseData =
  JamboResponseData & {
    readonly email_status: 'already_registered' | 'unconfirmed';
    readonly email: string;
  };

export const validateConfirmRegisterEmailForUtageWebRequest = (
  userId: string,
  email: string,
): ValidateConfirmRegisterEmailForUtageWebRequest => ({
  api: 'validate_confirm_register_email_for_utage_web',
  user_id: userId,
  email,
});
