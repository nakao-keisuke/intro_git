import { usePaymentCustomerData } from '@/hooks/usePaymentCustomerData.hook';

/**
 * ログイン時にクレジットカード登録状態を事前チェックするコンポーネント
 * Pages Router と App Router の両方で使用可能
 */
export const PaymentCustomerDataInitializer = (): null => {
  // セッション開始時にクレジットカード登録状態をチェック
  usePaymentCustomerData();

  return null;
};
