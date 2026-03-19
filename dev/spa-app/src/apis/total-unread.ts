import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type TotalUnreadRequest = JamboRequest & {
  readonly api: 'total_unread';
  readonly token: string;
};

export type TotalUnreadResponseData = JamboResponseData & {
  readonly unread_num: number;
};

export const totalUnreadRequest = (token: string): TotalUnreadRequest => {
  return {
    api: 'total_unread',
    token: token,
  };
};
