import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type footerPrintHistoryRequest = JamboRequest & {
  readonly api: 'get_footprint_history_for_web';
  readonly token: string;
  readonly skip: number;
  readonly take: number;
};

export type FooterPrintResponseData = JamboResponseData & {
  readonly user_id: string;
  readonly user_name: string;
  readonly age: number;
  readonly region: number;
  readonly ava_id: string;
  readonly abt?: string;
  readonly voice_call_waiting?: boolean;
  readonly video_call_waiting?: boolean;
  readonly last_login?: string;
  readonly chk_time: string;
  readonly bust_size: string;
  readonly h_level: string;
  readonly is_new_user: boolean;
};

export function getFooterPrintHistoryRequest(
  token: string,
  skip = 0,
  take = 50,
): footerPrintHistoryRequest {
  return {
    api: 'get_footprint_history_for_web',
    token: token,
    skip,
    take,
  };
}
