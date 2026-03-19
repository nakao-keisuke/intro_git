import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type GetSessionBoardMessageRequest = JamboRequest & {
  readonly api: 'get_session_board_message';
  readonly token: string;
  readonly skip: 0;
  readonly region: null;
};

export type GetSessionBoardMessageResponseElementData = JamboResponseData & {
  readonly user_id: string;
  readonly user_name: string;
  readonly age: number;
  readonly region: number;
  readonly ava_id: string;
  readonly voice_call_waiting?: boolean;
  readonly video_call_waiting?: boolean;
  readonly message: string;
  readonly created: string;
  readonly has_lovense: boolean;
  readonly bust_size?: string;
  readonly h_level?: string;
  readonly is_new?: boolean;
  readonly is_new_user?: boolean;
  readonly reg_date?: string;
  readonly is_online: boolean;
};

export const getSessionBoardMessageRequest = (
  token: string,
): GetSessionBoardMessageRequest => {
  return {
    api: 'get_session_board_message',
    token: token,
    skip: 0,
    region: null,
  };
};
