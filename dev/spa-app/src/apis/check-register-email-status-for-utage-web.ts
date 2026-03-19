import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type CheckRegisterEmailStatusForUtageWebRequest = JamboRequest & {
  readonly api: 'check_register_email_status_for_utage_web';
  readonly token: string;
};

export type CheckRegisterEmailStatusForUtageWebResponseData =
  JamboResponseData &
    (
      | {
          readonly email_status: 'already_registered' | 'unconfirmed';
          readonly email: string;
        }
      | {
          readonly email_status: 'not_registered';
        }
    );

export const checkRegisterEmailStatusForUtageWebRequest = (
  token: string,
): CheckRegisterEmailStatusForUtageWebRequest => ({
  api: 'check_register_email_status_for_utage_web',
  token,
});
