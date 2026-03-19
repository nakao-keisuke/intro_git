import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetLovenseMenuListRequest extends JamboRequest {
  readonly api: 'get_lovense_menu_list';
  readonly token: string;
  readonly partner_id: string;
  readonly call_type: 'live' | 'side_watch' | 'video';
}

export interface GetLovenseMenuListResponseData extends JamboResponseData {
  readonly lovense_menu_list: GetLovenseMenuListResponseElementData[];
}

export type GetLovenseMenuListResponseElementData = {
  readonly duration: number;
  readonly consume_point: number;
  readonly index: number;
  readonly type: string;
  readonly display_name: string;
  readonly ticket_count?: number;
};

export const getLovenseMenuListRequest = (
  token: string,
  partnerId: string,
  callType: 'live' | 'side_watch' | 'video',
): GetLovenseMenuListRequest => ({
  api: 'get_lovense_menu_list',
  token,
  partner_id: partnerId,
  call_type: callType,
});
