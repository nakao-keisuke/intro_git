import type { JamboRequest } from '@/types/JamboApi';

interface UpdateFleaMarketTransactionRequest extends JamboRequest {
  api: 'update_flea_market_transaction';
  token: string;
  transaction_id: string;
  status: 'pending' | 'shipping' | 'completed' | 'canceled';
}

export const updateFleaMarketTransactionRequest = (
  token: string,
  transaction_id: string,
  status: 'pending' | 'shipping' | 'completed' | 'canceled',
): UpdateFleaMarketTransactionRequest => ({
  api: 'update_flea_market_transaction',
  token,
  transaction_id,
  status,
});
