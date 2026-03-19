import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type LstFavRequest = JamboRequest & {
  readonly api: 'lst_fav';
  readonly token: string;
};

export type LstFavResponseElementData = JamboResponseData & {
  readonly user_id: string;
  readonly user_name: string;
  readonly age: number;
  readonly region: number;
  readonly ava_id: string;
  readonly abt?: string;
  readonly voice_call_waiting?: boolean;
  readonly video_call_waiting?: boolean;
};

export function lstFavRequest(token: string): LstFavRequest {
  return {
    api: 'lst_fav',
    token: token,
  };
}
