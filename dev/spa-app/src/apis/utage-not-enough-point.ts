import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type UtageNotEnoughPointRequest = JamboRequest & {
  readonly api: 'utage_not_enough_point';
  readonly token: string;
};

export type UtageNotEnoughPointResponseData = JamboResponseData & {};

export const utageNotEnoughPointRequest = (
  token: string,
): UtageNotEnoughPointRequest => ({
  api: 'utage_not_enough_point',
  token,
});
