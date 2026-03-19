import type { JamboResponseData } from '@/types/JamboApi';

interface GetPointRequestData {
  readonly api: 'get_point';
  readonly token: string;
}

export interface GetPointResponseData extends JamboResponseData {
  readonly point: number;
}

export function getPointRequest(token: string): GetPointRequestData {
  return {
    api: 'get_point',
    token: token,
  };
}
