/**
 * Amazon Payの決済状態を表している
 *
 * @type {{ readonly Open: "Open"; readonly Completed: "Completed"; readonly Failed: "Failed"; }}
 * Open: Amazon Pay側での決済中
 * Completed: Amazon Pay側での決済完了
 * Failed: 決済失敗
 * Finalized: Amazon&Jambo全体での決済フロー完了
 */
export const AmazonPaymentStatus = {
  Pending: 'Pending',
  Open: 'Open',
  Completed: 'Completed',
  Failed: 'Failed',
  Finalized: 'Finalized',
} as const;

export type AmazonPaymentStatus =
  (typeof AmazonPaymentStatus)[keyof typeof AmazonPaymentStatus];
