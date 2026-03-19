import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetPasswordForLoginWebByMobileUserRequest extends JamboRequest {
  readonly api: 'get_password_for_login_web_by_mobile_user';
  readonly token: string;
}

export interface GetPasswordForLoginWebByMobileUserResponseData
  extends JamboResponseData {
  readonly pwd: string;
}

export function getPasswordForLoginWebByMobileUserRequest(
  token: string,
): GetPasswordForLoginWebByMobileUserRequest {
  return {
    api: 'get_password_for_login_web_by_mobile_user',
    token: token,
  };
}
