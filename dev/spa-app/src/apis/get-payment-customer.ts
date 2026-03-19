import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type GetPaymentCustomerJamboRequest = JamboRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_PAYMENT_CUSTOMER;
  readonly token: string;
};

export type GetPaymentCustomerResponseData = JamboResponseData & {
  default_payment_method_id: string;
  stripe_customer_id: string;
};

export const getPaymentCustomerRequest = (
  token: string,
): GetPaymentCustomerJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_PAYMENT_CUSTOMER,
  token,
});
