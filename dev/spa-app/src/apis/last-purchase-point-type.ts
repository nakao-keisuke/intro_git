import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type LastPurchasePointTypeRequest = JamboRequest & {
  api: 'get_last_payment_method';
  token: string;
};

export type LastPurchasePointTypeResponseData = JamboResponseData & {
  readonly last_payment_method: string;
};

export const lastPurchasePointTypeRequest = (
  token: string,
): LastPurchasePointTypeRequest => ({
  api: 'get_last_payment_method',
  token,
});
