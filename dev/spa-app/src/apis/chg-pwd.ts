import type { JamboRequest } from '@/types/JamboApi';

type ChgPwdRequest = JamboRequest & {
  api: 'chg_pwd';
  token: string;
  new_pwd: string;
  old_pwd: string;
  original_pwd: string;
  application: 15;
};
export type ChgPwdResponseData = {};

export const chgPwdRequest = (
  token: string,
  new_pwd: string,
  old_pwd: string,
  original_pwd: string,
): ChgPwdRequest => ({
  api: 'chg_pwd',
  token,
  new_pwd,
  old_pwd,
  original_pwd,
  application: 15,
});
