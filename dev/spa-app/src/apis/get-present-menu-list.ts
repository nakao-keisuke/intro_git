import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetPresentMenuListRequest extends JamboRequest {
  readonly api: 'get_video_chat_menu_list';
  readonly token: string;
  readonly partner_id: string;
}

export interface GetPresentMenuListResponseData extends JamboResponseData {
  readonly menu_list: GetPresentMenuListResponseElementData[];
}

export type GetPresentMenuListResponseElementData = {
  readonly consume_point: number;
  readonly index: number;
  readonly type: string;
  readonly text: string;
};

export const getPresentMenuListRequest = (
  token: string,
  partnerId: string,
): GetPresentMenuListRequest => ({
  api: 'get_video_chat_menu_list',
  token,
  partner_id: partnerId,
});
