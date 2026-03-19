import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetPhoneVerificationStatusRequest extends JamboRequest {
  readonly api: 'get_phone_verification_status';
  readonly token: string;
}

export interface GetPhoneVerificationStatusResponseData
  extends JamboResponseData {
  readonly verified: boolean;
}

export function getPhoneVerificationStatusRequest(
  token: string,
): GetPhoneVerificationStatusRequest {
  return {
    api: 'get_phone_verification_status',
    token: token,
  };
}
