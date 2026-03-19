import type { Context } from './type';

/**
 * http通信をするためのインターフェース
 */
export interface HttpClientOptions extends RequestInit {
  timeoutMs?: number;
}

/** クライアント側APIリクエストのタイムアウト時間（ミリ秒） */
/** 現在のデフォルトは200ミリ秒くらいなので仮置き */
export const CLIENT_API_TIMEOUT_MS = 2000;

export interface HttpClient {
  // どこで動くHttpClientかを返す
  getContext: () => Context;
  // GETリクエストを送る
  get: <T>(url: string, options?: HttpClientOptions) => Promise<T>;
  // POSTリクエストを送る
  post: <T>(
    url: string,
    body: object,
    options?: HttpClientOptions,
  ) => Promise<T>;
}
