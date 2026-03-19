import type { ApiRouteResponse } from '@/types/ApiRoute';

// Route Handler の成功時データ（CamelCase）
export type PaymentCustomerRouteData = {
  readonly defaultPaymentMethodId: string;
  readonly stripeCustomerId: string;
};

// クライアント⇔Route Handler のレスポンス型
export type PaymentCustomerRouteResponse = ApiRouteResponse<
  PaymentCustomerRouteData | undefined
>;
