export type ResponseData<T> = (T & { readonly type?: 'success' }) | ErrorData;

export type ErrorData = {
  readonly type: 'error';
  readonly message: string;
  readonly code?: string | number;
  readonly notEnoughPoint?: boolean;
  readonly isNeedToReLoginWithClean?: boolean;
  readonly isNeedToShowAxesCustomerSupportInfo?: boolean;
  readonly isLovenseOffline?: boolean;
  readonly transactionId?: string | null;
};
