import type { JamboRequest } from '@/types/JamboApi';

interface GetCallHistoryRequest extends JamboRequest {
  readonly api: 'call_history_for_2nd_apps';
  readonly token: string;
  readonly gender: number;
}

export interface GetCallHistoryResponseData {
  call_history: GetCallHistoryResponseElementData[];
}

export type GetCallHistoryResponseElementData = {
  readonly start_time: string;
  readonly partner_id: string;
  readonly call_type: 'live' | 'side_watch' | 'video' | 'voice';
  readonly user: {
    readonly gender: number;
    readonly last_login_time: string;
    readonly user_id: string;
    readonly online_status: string;
    readonly user_name: string;
    readonly voice_call_waiting: boolean;
    readonly region: number;
    readonly ava_id: string;
    readonly age: number;
    readonly video_call_waiting: boolean;
  };
};

export const getCallHistoryRequest = (
  token: string,
  gender: number,
): GetCallHistoryRequest => ({
  api: 'call_history_for_2nd_apps',
  token,
  gender,
});
