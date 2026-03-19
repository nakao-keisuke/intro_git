import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type UpdateCallWaitingRequest = JamboRequest & {
  readonly api: 'set_call_waiting';
  readonly token: string;
  readonly video_call_waiting: boolean;
  readonly voice_call_waiting: boolean;
  readonly offline_call: boolean;
};

export type UpdateCallWaitingResponseData = JamboResponseData & {};

export const updateCallWaitingRequest = (
  token: string,
  video_call_waiting: boolean,
  voice_call_waiting: boolean,
  offline_call: boolean,
): UpdateCallWaitingRequest => ({
  api: 'set_call_waiting',
  token,
  video_call_waiting,
  voice_call_waiting,
  offline_call,
});
