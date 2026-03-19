import type { JamboRequest } from '@/types/JamboApi';

interface UpdateFleaMarketShipmentStatusRequest extends JamboRequest {
  api: 'update_flea_market_shipment_status';
  token: string;
  user_id: string;
  shipping_id: string;
  status: 'received';
  notes: string;
}

export const updateFleaMarketShipmentStatusRequest = (
  token: string,
  user_id: string,
  shipping_id: string,
): UpdateFleaMarketShipmentStatusRequest => ({
  api: 'update_flea_market_shipment_status',
  token,
  user_id,
  shipping_id,
  status: 'received',
  notes: '商品を受け取りました', //将来的にはユーザーが入力するようにする
});
