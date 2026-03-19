/**
 * 購入イベント送信の重複を防ぐためのユーティリティ
 * SessionStorageを使用してtransaction_idを管理し、同一購入の重複送信を防止
 */

const SENT_TRANSACTIONS_KEY = 'sent_purchase_transactions';
const TRANSACTION_EXPIRY_MS = 48 * 60 * 60 * 1000; // 48時間
const MAX_STORED_TRANSACTIONS = 100; // 最大保存件数

type SentTransaction = {
  transactionId: string;
  timestamp: number;
  amount: number;
  point: number;
};

/**
 * トランザクションIDが既に送信済みかチェック
 * @param transactionId チェックするtransaction_id
 * @returns 送信済みの場合true
 */
export function isTransactionSent(transactionId: string): boolean {
  if (typeof window === 'undefined') return false;

  // 空文字列チェック
  if (!transactionId || transactionId.trim() === '') {
    console.warn('Empty transaction ID provided');
    return false;
  }

  try {
    const stored = sessionStorage.getItem(SENT_TRANSACTIONS_KEY);
    if (!stored) return false;

    const transactions: SentTransaction[] = JSON.parse(stored);
    const now = Date.now();

    // 期限切れのトランザクションを削除
    const validTransactions = transactions.filter(
      (tx) => now - tx.timestamp < TRANSACTION_EXPIRY_MS,
    );

    // 更新されたリストを保存
    if (validTransactions.length !== transactions.length) {
      sessionStorage.setItem(
        SENT_TRANSACTIONS_KEY,
        JSON.stringify(validTransactions),
      );
    }

    return validTransactions.some((tx) => tx.transactionId === transactionId);
  } catch (error) {
    console.error('Failed to check transaction:', error);
    return false;
  }
}

/**
 * トランザクションIDを送信済みとしてマーク
 * @param transactionId マークするtransaction_id
 * @param amount 購入金額
 * @param point 付与ポイント数
 */
export function markTransactionAsSent(
  transactionId: string,
  amount: number,
  point: number,
): void {
  if (typeof window === 'undefined') return;

  // 空文字列チェック
  if (!transactionId || transactionId.trim() === '') {
    console.warn('Empty transaction ID provided');
    return;
  }

  // 数値検証
  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(point) ||
    amount <= 0 ||
    point <= 0
  ) {
    console.error('Invalid amount or point:', { amount, point });
    return;
  }

  try {
    const stored = sessionStorage.getItem(SENT_TRANSACTIONS_KEY);
    const transactions: SentTransaction[] = stored ? JSON.parse(stored) : [];

    // 既に存在する場合は追加しない
    if (transactions.some((tx) => tx.transactionId === transactionId)) {
      return;
    }

    // 最大保存件数を超える場合、最古のものを削除
    if (transactions.length >= MAX_STORED_TRANSACTIONS) {
      transactions.shift();
    }

    transactions.push({
      transactionId,
      timestamp: Date.now(),
      amount,
      point,
    });

    sessionStorage.setItem(SENT_TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to mark transaction as sent:', error);
  }
}

/**
 * トランザクションIDを生成（存在しない場合）
 * @param amount 購入金額
 * @param point 付与ポイント数
 * @returns 生成されたtransaction_id
 */
export function generateTransactionId(amount: number, point: number): string {
  const timestamp = Date.now();
  const random = crypto.randomUUID().substring(0, 8);
  return `T_${amount}_${point}_${timestamp}_${random}`;
}
