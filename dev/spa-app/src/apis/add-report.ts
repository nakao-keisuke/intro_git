import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type AddReportRequest = JamboRequest & {
  readonly api: 'rpt';
  readonly token: string;
  readonly rpt_type: number;
  readonly subject_type: number;
  readonly subject_id: string;
};

export type AddReportResponseData = JamboResponseData & {};

export const addReportRequest = (
  token: string,
  subject_id: string,
): AddReportRequest => ({
  api: 'rpt',
  token,
  rpt_type: 1,
  subject_type: 2,
  subject_id,
});
