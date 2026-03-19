import type {
  TransactionDisplay,
  TransactionItemData,
} from '@/types/fleamarket/transaction';
import { formatFullDateTime } from '@/utils/dateFormat';

// トランザクションデータを表示用形式に変換
export const transformTransactionItemToDisplay = (
  data: TransactionItemData,
): TransactionDisplay => {
  const transaction = data.transaction || data;
  const item = data.item || {};

  return {
    transaction_id: transaction.transaction_id || '',
    item_id: transaction.item_id || '',
    seller_id: transaction.seller_id || '',
    buyer_id: transaction.buyer_id || '',
    price: transaction.price || 0,
    status: transaction.status || '',
    created_at: transaction.created_at || '',
    updated_at: transaction.updated_at || '',
    item_title:
      item.title || `商品 #${transaction.item_id || data.item_id || ''}`,
    item_images: item.images || [],
    item_price: item.price || transaction.price || 0,
  };
};

// ステータスラベルを取得
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return '取引中';
    case 'shipping':
      return '発送済み';
    case 'completed':
      return '取引完了';
    case 'cancelled':
      return 'キャンセル';
    default:
      return status;
  }
};

// ステータスクラスを取得
export const getStatusClass = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'shipping':
      return 'shipping';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return '';
  }
};

// 日付フォーマット（日本時間で詳細表示）
export const formatDate = formatFullDateTime;

// 取引中の取引をフィルタリング
export const getBuyingTransactions = (
  transactions: TransactionDisplay[],
): TransactionDisplay[] => {
  return transactions.filter(
    (t) =>
      t.status === 'pending' ||
      t.status === 'shipping' ||
      t.status === 'awaiting_payment',
  );
};

// 過去の取引をフィルタリング
export const getBoughtTransactions = (
  transactions: TransactionDisplay[],
): TransactionDisplay[] => {
  return transactions.filter(
    (t) => t.status === 'completed' || t.status === 'cancelled',
  );
};
