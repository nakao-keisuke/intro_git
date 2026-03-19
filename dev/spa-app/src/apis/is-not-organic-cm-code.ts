import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

export type IsNotOrganicCmCodeRequest = JamboRequest & {
  readonly api: 'check_is_not_organic_cm_code';
  readonly token: string;
};

export type IsNotOrganicCmCodeResponseData = JamboResponseData & {
  readonly is_not_organic_cm_code: boolean;
};

export const isNotOrganicCmCodeRequest = (
  token: string,
): IsNotOrganicCmCodeRequest => ({
  api: 'check_is_not_organic_cm_code',
  token: token,
});
