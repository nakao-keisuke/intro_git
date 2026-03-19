import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type LogUtageWebConsumedPointRequest = JamboRequest & {
  readonly api: 'log_utage_web_consumed_point';
  readonly token: string;
  readonly point: number;
};

export type LogUtageWebConsumedPointResponseData = JamboResponseData & {};

export const logUtageWebConsumedPointRequest = (
  token: string,
  point: number,
): LogUtageWebConsumedPointRequest => ({
  api: 'log_utage_web_consumed_point',
  token,
  point,
});
