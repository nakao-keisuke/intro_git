import type { JamboRequest } from '@/types/JamboApi';

interface GetFleaMarketTransactionDetailRequest extends JamboRequest {
  readonly api: 'get_flea_market_transaction_detail';
  readonly token: string;
  readonly transaction_id: string;
}

export interface FleaMarketTransactionDetail {
  readonly transaction_id: string;
  readonly item_id: string;
  readonly seller_id: string;
  readonly buyer_id: string;
  readonly price: number;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly item?: {
    readonly title: string;
    readonly description: string;
    readonly price: number;
    readonly category: string;
    readonly images: string[];
  } | null;
  readonly seller?: {
    readonly user_id: string;
    readonly name: string;
    readonly profile_image?: string;
  } | null;
  readonly buyer?: {
    readonly user_id: string;
    readonly name: string;
    readonly profile_image?: string;
  } | null;
}

export type GetFleaMarketTransactionDetailResponseData =
  FleaMarketTransactionDetail;

export function getFleaMarketTransactionDetailRequest(
  token: string,
  transactionId: string,
): GetFleaMarketTransactionDetailRequest {
  return {
    api: 'get_flea_market_transaction_detail',
    token: token,
    transaction_id: transactionId,
  };
}
