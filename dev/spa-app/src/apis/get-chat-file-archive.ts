import type { JamboRequest } from '@/types/JamboApi';

type GetChatFileArchiveRequest = JamboRequest & {
  readonly api: 'get_chat_file_archive';
  readonly token: string;
  readonly partner_id: string;
};

export type GetChatFileArchiveResponseElementData = Array<{
  duration: number | null;
  media_type: string;
  send_date: string;
  purchaser_id: string;
  media_id: string;
  sender_id: string;
  is_purchased: boolean;
  is_own: boolean;
}>;

export const getChatFileArchiveRequest = (
  token: string,
  partner_id: string,
): GetChatFileArchiveRequest => {
  return {
    api: 'get_chat_file_archive',
    token: token,
    partner_id: partner_id,
  };
};
