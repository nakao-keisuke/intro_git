/**
 * Adjustのイベント送信リクエストパラメータの型定義
 */
export type AdjustEventRequest = {
  /**
   * イベントトークン（Adjustダッシュボードで取得）
   */
  eventToken: string;

  /**
   * Webトラッキング用の匿名ID（Webのみ）
   */
  webUUID: string;

  /**
   * その他のオプションパラメータ
   */
  [key: string]: any;
};

/**
 * Adjustのイベント送信レスポンスの型定義
 */
export type AdjustEventResponse = {
  /**
   * 成功したかどうか
   */
  success: boolean;

  /**
   * レスポンスメッセージ
   */
  message?: string;

  /**
   * レスポンスデータ
   */
  data?: any;
};
