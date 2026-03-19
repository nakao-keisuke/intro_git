import type { JamboRequest } from '@/types/JamboApi';

type ChangeEmailVersion2Request = JamboRequest & {
  readonly api: 'change_email_version_2';
  readonly token: string;
  readonly email: string;
  readonly new_pwd?: string;
  readonly original_pwd?: string;
  readonly application: 15;
};

export type ChangeEmailVersion2ResponseData = {};

export const changeEmailVersion2RequestForRegister = (
  token: string,
  email: string,
  newPwd: string,
  originalPwd: string,
): ChangeEmailVersion2Request => ({
  api: 'change_email_version_2',
  token,
  email,
  new_pwd: newPwd,
  original_pwd: originalPwd,
  application: 15,
});

export const changeEmailVersion2RequestForChange = (
  token: string,
  email: string,
): ChangeEmailVersion2Request => ({
  api: 'change_email_version_2',
  token,
  email,
  application: 15,
});
