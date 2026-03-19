/**
 * 決済方法のenum定義
 * GA4イベント送信時のpayment_methodパラメータに使用
 */
export enum PaymentMethod {
  CREDIT = 'credit',
  PAIDY = 'paidy',
  AMAZON_PAY = 'amazon pay',
  GOOGLE_PAY = 'Google Pay',
  APPLE_PAY = 'Apple Pay',
}
