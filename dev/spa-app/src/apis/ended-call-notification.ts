import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type EndedCallNotificationJamboRequest = JamboRequest & {
  readonly api: typeof JAMBO_API_ROUTE.ENDED_CALL_NOTIFICATION;
  readonly channel_name?: string;
  readonly call_type: 'voice' | 'video' | 'live';
  readonly user_id: string;
  readonly partner_id: string;
  readonly duration: number;
};

export type EndedCallNotificationJamboResponse = JamboResponseData;

export const endedCallNotificationRequest = (
  channelName: string,
  callType: 'voice' | 'video' | 'live',
  requestUserId: string,
  partnerUserId: string,
  duration: number,
): EndedCallNotificationJamboRequest => ({
  api: JAMBO_API_ROUTE.ENDED_CALL_NOTIFICATION,
  channel_name: channelName,
  call_type: callType,
  user_id: requestUserId,
  partner_id: partnerUserId,
  duration,
});
