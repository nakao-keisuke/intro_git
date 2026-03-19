import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetTradablePointRequest extends JamboRequest {
  readonly api: 'get_tradable_point';
  readonly user_id: string;
}

export interface GetTradablePointResponseData extends JamboResponseData {
  readonly tradable_point: number;
  readonly untradable_point: number | null;
}

export function getTradablePointRequest(
  user_id: string,
): GetTradablePointRequest {
  return {
    api: 'get_tradable_point',
    user_id: user_id,
  };
}
