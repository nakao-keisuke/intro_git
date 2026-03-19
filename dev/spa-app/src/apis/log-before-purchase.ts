// import { JamboRequest, JamboResponseData } from "@/types/JamboApi";
// import exp from "constants";

import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type LogBeforePurchaseRequest = JamboRequest & {
  readonly api: 'log_before_purchase';
  readonly pck_id: string;
  readonly device_type: number;
  readonly pri: number;
  readonly token: string;
};

export type LogBeforePurchaseResponseData = JamboResponseData & {};

export const logBeforePurchaseRequest = (
  pck_id: string,
  device_type: number,
  pri: number,
  token: string,
): LogBeforePurchaseRequest => ({
  api: 'log_before_purchase',
  pck_id,
  device_type,
  pri,
  token,
});
