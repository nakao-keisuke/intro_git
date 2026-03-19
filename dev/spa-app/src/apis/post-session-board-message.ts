import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type PostSessionBoardMessageRequest = JamboRequest & {
  readonly api: 'post_session_board_message';
  readonly message: string;
  readonly token: string;
  readonly is_from_web: boolean;
};

export type PostSessionBoardMessageResponseData = JamboResponseData & {};

export const postSessionBoardMessageRequest = (
  token: string,
  message: string,
): PostSessionBoardMessageRequest => {
  return {
    api: 'post_session_board_message',
    token,
    message,
    is_from_web: true,
  };
};
