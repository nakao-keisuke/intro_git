import type { JamboResponseData } from '@/types/JamboApi';

export interface GetFleaMarketShipmentsDetailRequest {
  api: 'get_flea_market_shipments_detail';
  token: string;
  user_id: string;
  transaction_id: string;
}

export type ShipmentStatus =
  | 'preparing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'returned'
  | 'received';

export interface ShipmentStatusHistory {
  status: ShipmentStatus;
  updated_at: number;
  updated_by: string;
}

export interface GetFleaMarketShipmentsDetailResponseData
  extends JamboResponseData {
  shipping_id: string;
  transaction_id: string;
  status: ShipmentStatus;
  notes: string;
  status_history: ShipmentStatusHistory[];
  created_at: number;
  updated_at: number;
}

export interface GetFleaMarketShipmentsDetailResponse
  extends JamboResponseData {
  result: string;
  data?: GetFleaMarketShipmentsDetailResponseData;
  message?: string;
  errorCode?: number;
}

export function getFleaMarketShipmentsDetailRequest(
  token: string,
  userId: string,
  transactionId: string,
): GetFleaMarketShipmentsDetailRequest {
  return {
    api: 'get_flea_market_shipments_detail',
    token: token,
    user_id: userId,
    transaction_id: transactionId,
  };
}
