import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface CheckIncomingCallRequest extends JamboRequest {
  readonly api: 'get_web_incoming_call';
  readonly token: string;
}

export interface CheckIncomingCallResponseData extends JamboResponseData {
  readonly incoming_call_info: GetIncomingCallResponseElementData;
}

export interface GetIncomingCallResponseElementData {
  partnerId: string;
  appId: string;
  rtmChannelToken: string;
  rtcChannelToken: string;
  channelId: string;
  callType: string;
  date: string;
  isPartnerInSecondApps?: boolean;
}

export function checkIncomingCallRequest(
  token: string,
): CheckIncomingCallRequest {
  return {
    api: 'get_web_incoming_call',
    token: token,
  };
}
