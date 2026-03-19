import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type AddPointRequest = JamboRequest & {
  readonly api: 'add_point';
  readonly token: string;
  readonly id: string;
  readonly tradable_point: number;
  readonly untradable_point: 0;
  readonly point_type: 258;
  readonly money: number;
};

export type AddPointResponseData = JamboResponseData & {};

export const addPointRequest = (
  token: string,
  id: string,
  tradable_point: number,
  money: number,
): AddPointRequest => ({
  api: 'add_point',
  token,
  id,
  tradable_point,
  untradable_point: 0,
  point_type: 258,
  money,
});
