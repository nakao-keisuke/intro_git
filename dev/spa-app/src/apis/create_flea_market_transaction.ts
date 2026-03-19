import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface CreateFleaMarketTransactionRequest extends JamboRequest {
  readonly api: 'create_flea_market_transaction';
  readonly token: string;
  readonly item_id: string;
  readonly buyer_id: string;
}

export interface CreateFleaMarketTransactionResponseData
  extends JamboResponseData {
  readonly transaction_id: string;
}

export function createFleaMarketTransactionRequest(
  token: string,
  itemId: string,
  buyerId: string,
): CreateFleaMarketTransactionRequest {
  return {
    api: 'create_flea_market_transaction',
    token: token,
    item_id: itemId,
    buyer_id: buyerId,
  };
}
