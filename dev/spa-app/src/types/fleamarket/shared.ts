export interface FleaMarketItem {
  item_id: string;
  title: string;
  price: number;
  images: string[];
  description: string;
  category: string;
  seller_id: string;
  sales_status: string;
  review_status: string;
  created_at: number;
  updated_at: number;
}

export interface FleaMarketTransaction {
  transaction_id: string;
  item_id: string;
  seller_id: string;
  buyer_id: string;
  price: number;
  status: string;
  display_id: string;
  created_at: number;
  updated_at: number;
}

export interface TransactionWithItem {
  item: FleaMarketItem;
  transaction: FleaMarketTransaction;
}
