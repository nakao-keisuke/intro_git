import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type DeActRequest = JamboRequest & {
  api: 'de_act';
  token: string;
  cmt: string;
};

export type DeActResponseData = JamboResponseData;

export const deActRequest = (token: string, cmt: string): DeActRequest => {
  return {
    api: 'de_act',
    token,
    cmt,
  };
};
