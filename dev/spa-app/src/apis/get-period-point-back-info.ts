import type { JamboRequest } from '@/types/JamboApi';

interface GetPeriodPointBackInfoRequest extends JamboRequest {
  readonly api: 'get_period_point_back_info';
  readonly token: string;
  readonly period_type: string;
}

export interface GetPeriodPointBackInfoResponseData {
  predicted_points_at_next_level: number;
  used_point: number;
  points_until_next_level: number;
  predicted_return_points: number;
  period_type: string;
  return_point: number;
}

export const getPeriodPointBackInfoRequest = (
  token: string,
  period_type: string,
): GetPeriodPointBackInfoRequest => {
  return {
    api: 'get_period_point_back_info',
    token,
    period_type,
  };
};
