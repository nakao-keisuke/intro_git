import type { FleaMarketTransactionListItem } from '@/apis/get-flea-market-transaction-list';

// 簡素化されたトランザクション表示用の型
export interface TransactionDisplay {
  transaction_id: string;
  item_id: string;
  seller_id: string;
  buyer_id: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  // 商品情報（基本的なもののみ）
  item_title?: string;
  item_images?: string[];
  item_price?: number;
}

// トランザクション項目の基本構造
export interface TransactionItemData {
  transaction?: {
    transaction_id: string;
    item_id: string;
    seller_id: string;
    buyer_id: string;
    price: number;
    status: string;
    created_at: string;
    updated_at: string;
  };
  item?: {
    title?: string;
    images?: string[];
    price?: number;
  };
  // 直接プロパティとして存在する場合の型
  transaction_id?: string;
  item_id?: string;
  seller_id?: string;
  buyer_id?: string;
  price?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// レスポンスデータの型
export interface TransactionListResponseData {
  transactions?: FleaMarketTransactionListItem[];
  total?: number;
}
