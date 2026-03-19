import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type GetBlockListRequest = JamboRequest & {
  readonly api: 'lst_blk';
  readonly token: string;
  readonly skip: number;
  readonly take: number;
};

export type GetBlockListResponseData = JamboResponseData & {
  readonly abt: string;
  readonly gender: number;
  readonly user_id: string;
  readonly user_name: string;
  readonly ava_id: string;
  readonly region: number;
  readonly category: number;
  readonly age: number;
};

export const getBlockListRequest = (
  token: string,
  skip: number,
  take: number,
): GetBlockListRequest => {
  return {
    api: 'lst_blk',
    token: token,
    skip: skip,
    take: take,
  };
};
