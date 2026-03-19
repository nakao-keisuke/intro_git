import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type GetUtageWebPointInfoRequest = JamboRequest & {
  readonly api: 'get_utage_web_point_info';
  readonly token: string;
};

export type GetUtageWebPointInfoResponseData = JamboResponseData & {
  readonly is_purchased: boolean;
  readonly point: number;
};

export const getUtageWebPointInfoRequest = (
  token: string,
): GetUtageWebPointInfoRequest => {
  return {
    api: 'get_utage_web_point_info',
    token: token,
  };
};
