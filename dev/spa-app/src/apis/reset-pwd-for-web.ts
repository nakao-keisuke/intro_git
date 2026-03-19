import type { JamboRequest } from '@/types/JamboApi';

type ResetPwdForWebRequest = JamboRequest & {
  api: 'reset_pwd_for_web';
  from_user_id: string;
  new_pwd: string;
  original_pwd: string;
};
export type ResetPwdForWebResponseData = {};

export const resetPwdForWebRequest = (
  from_user_id: string,
  new_pwd: string,
  original_pwd: string,
): ResetPwdForWebRequest => ({
  api: 'reset_pwd_for_web',
  from_user_id,
  new_pwd,
  original_pwd,
});
