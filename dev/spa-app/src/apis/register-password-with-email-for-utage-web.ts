import type { JamboRequest } from '@/types/JamboApi';

type RegisterPasswordWithEmailForUtageWebRequest = JamboRequest & {
  readonly api: 'reg_pwd_with_email_for_utage_web';
  readonly user_id: string;
  readonly email: string;
  readonly new_pwd: string;
  readonly original_pwd: string;
  readonly application: 15;
};

export type RegsiterPasswordWithEmailForUtageWebResponseData = {};

export const registerPasswordWithEmailForUtageWebRequest = (
  userId: string,
  email: string,
  originalPwd: string,
  newPwd: string,
): RegisterPasswordWithEmailForUtageWebRequest => ({
  api: 'reg_pwd_with_email_for_utage_web',
  user_id: userId,
  email,
  original_pwd: originalPwd,
  new_pwd: newPwd,
  application: 15,
});
