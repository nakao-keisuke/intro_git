import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetUncompletedLovenseLogByRoomRequest extends JamboRequest {
  readonly api: 'get_uncompleted_lovense_log_by_room';
  readonly token: string;
  readonly female_id: string;
}

export interface GetUncompletedLovenseLogByRoomResponseData
  extends JamboResponseData {
  readonly log_lovense_menu_list: GetUncompletedLovenseLogByRoomResponseElementData[];
}

export type GetUncompletedLovenseLogByRoomResponseElementData = {
  readonly male_name: string;
  readonly duration: number;
  readonly start_time: number;
  readonly end_time: number;
  readonly type: string;
  readonly just_started: boolean;
};

export const getUncompletedLovenseLogByRoomRequest = (
  token: string,
  female_id: string,
): GetUncompletedLovenseLogByRoomRequest => ({
  api: 'get_uncompleted_lovense_log_by_room',
  token: token,
  female_id: female_id,
});
