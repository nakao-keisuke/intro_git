// /lib/http/BaseHttpClient.ts
import type { HttpClient, HttpClientOptions } from './HttpClient';
import type { Context } from './type';

/**
 * 共通ロジック（timeout, basic error mapping）を入れる抽象クラス
 * - サブクラスは get/post を実装する
 */
export abstract class BaseHttpClient implements HttpClient {
  protected timeoutMs = 8000;

  protected async timeoutFetch(
    input: RequestInfo,
    init?: RequestInit,
    customTimeoutMs?: number,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = customTimeoutMs ?? this.timeoutMs;
    const id = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  }

  // 以下メソッドはサブクラスに実装を委譲
  abstract getContext(): Context;
  abstract get<T>(url: string, options?: HttpClientOptions): Promise<T>;
  abstract post<T>(
    url: string,
    body: object,
    options?: HttpClientOptions,
  ): Promise<T>;
}
