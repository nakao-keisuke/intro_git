import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type LstFvtRequest = JamboRequest & {
  readonly api: 'lst_fvt';
  readonly token: string;
};

export type LstFvtResponseElementData = JamboResponseData & {
  readonly user_id: string;
  readonly user_name: string;
  readonly age: number;
  readonly region: number;
  readonly ava_id: string;
  readonly abt?: string;
  readonly voice_call_waiting?: boolean;
  readonly video_call_waiting?: boolean;
};

export function lstFvtRequest(token: string): LstFvtRequest {
  return {
    api: 'lst_fvt',
    token: token,
  };
}
