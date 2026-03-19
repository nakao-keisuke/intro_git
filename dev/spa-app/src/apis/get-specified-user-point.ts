import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

export type GetSpecifiedUserPointRequest = JamboRequest & {
  readonly api: 'get_specified_user_point';
  readonly token: string;
  readonly partner_user_id: string;
};

export type GetSpecifiedUserPointResponseData = JamboResponseData & {
  readonly untradable_point: number;
  readonly point: number;
  readonly tradable_point: number;
};

export const getSpecifiedUserPointRequest = (
  token: string,
  partnerUserId: string,
): GetSpecifiedUserPointRequest => ({
  api: 'get_specified_user_point',
  token,
  partner_user_id: partnerUserId,
});
