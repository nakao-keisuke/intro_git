import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetRtmLoginAuthRequest extends JamboRequest {
  readonly api: 'get_rtm_login_auth';
  readonly token: string;
}

export interface GetRtmLoginAuthResponseData extends JamboResponseData {
  readonly appId: string;
  readonly rtm_channel_token: string;
}

export function getRtmLoginAuthRequest(token: string): GetRtmLoginAuthRequest {
  return {
    api: 'get_rtm_login_auth',
    token: token,
  };
}
