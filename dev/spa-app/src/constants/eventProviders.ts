/**
 * イベント送信プロバイダーの定義
 * GA4、Repro、Adjustなどのイベントトラッキングプロバイダーを一元管理
 */
export enum EventProvider {
  GA4 = 'GA4',
  Repro = 'Repro',
  Adjust = 'Adjust',
}

/**
 * Adjustプラットフォームの定義
 *
 * 注意:
 * - フォールバックは常にRenkaIos（計測の正確性を保つ）
 */
export enum AdjustPlatform {
  RenkaIos = 'RenkaIos',
  RenkaAndroid = 'RenkaAndroid',
  HikariIos = 'HikariIos',
  SakuraIos = 'SakuraIos',
  SumireIos = 'SumireIos',
}

/**
 * イベントトークン設定の型定義
 * 各プロバイダーのトークンをオプショナルで管理
 * トークンが定義されていないイベント・プロバイダーの組み合わせは送信しない（ホワイトリスト方式）
 */
export type EventTokenConfig = {
  [EventProvider.GA4]?: string;
  [EventProvider.Repro]?: string;
  [EventProvider.Adjust]?: Partial<Record<AdjustPlatform, string>>;
};
