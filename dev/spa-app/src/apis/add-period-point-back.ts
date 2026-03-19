import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type AddPeriodPointBackRequest = JamboRequest & {
  readonly api: 'add_period_point_back';
  readonly token: string;
  readonly period_type: string;
};

export type AddPeriodPointBackResponse = JamboResponseData & {
  readonly add_point: number;
};

export function addPeriodPointBackRequest(
  token: string,
  period_type: string,
): AddPeriodPointBackRequest {
  return {
    api: 'add_period_point_back',
    token,
    period_type,
  };
}
