import type { JamboRequest } from '@/types/JamboApi';

type GetChatFileArchiveRequest = JamboRequest & {
  readonly api: 'get_chat_file_archive';
  readonly token: string;
  readonly partner_id: string;
};

export type GetChatFileArchiveResponseElementData = Array<{
  duration: string | null; // 実際は "30.000000" のような文字列
  mediaType: string;
  sendDate: string;
  purchaserId: string | null;
  mediaId: string;
  senderId: string;
  isPurchased: boolean;
  isOwn: boolean;
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
