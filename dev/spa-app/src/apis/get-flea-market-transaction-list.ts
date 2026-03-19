import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface GetFleaMarketTransactionListRequest extends JamboRequest {
  readonly api: 'get_flea_market_transaction_list';
  readonly token: string;
  readonly user_id: string;
  readonly page: number;
  readonly limit: number;
}

export interface FleaMarketTransactionListItem {
  readonly transaction_id: string;
  readonly item_id: string;
  readonly seller_id: string;
  readonly buyer_id: string;
  readonly price: number;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface GetFleaMarketTransactionListResponseData
  extends JamboResponseData {
  readonly transactions: FleaMarketTransactionListItem[];
  readonly total: number;
}

export function getFleaMarketTransactionListRequest(
  token: string,
  userId: string,
  page: number = 1,
  limit: number = 20,
): GetFleaMarketTransactionListRequest {
  return {
    api: 'get_flea_market_transaction_list',
    token: token,
    user_id: userId,
    page: page,
    limit: limit,
  };
}
