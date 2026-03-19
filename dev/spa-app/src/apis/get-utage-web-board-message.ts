import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetUtageWebBoardMessageRequest extends JamboRequest {
  readonly api: 'get_utage_web_board_message';
  readonly token?: string;
  readonly skip: number;
}

export interface GetUtageWebBoardMessageResponseData extends JamboResponseData {
  readonly user_id: string;
  readonly user_name: string;
  readonly voice_call_waiting: boolean;
  readonly video_call_waiting: boolean;
  readonly ava_id: string;
  readonly region: number;
  readonly age: number;
  readonly abt: string | undefined;
  readonly message: string;
  readonly created: string;
  readonly has_lovense: boolean;
  readonly bust_size?: string;
  readonly h_level?: string;
  readonly is_new_user?: boolean;
  readonly reg_date?: string;
  readonly is_online: boolean;
}

export function getUtageWebBoardMessageRequest(
  token?: string,
  skip: number = 0,
): GetUtageWebBoardMessageRequest {
  return {
    api: 'get_utage_web_board_message',
    skip,
    ...(token ? { token } : {}),
  };
}
