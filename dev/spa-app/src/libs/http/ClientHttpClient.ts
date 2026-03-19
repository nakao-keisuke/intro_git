import {
  createNeverResolvingPromise,
  handleInvalidTokenForClient,
} from '@/utils/invalidTokenHandler';
import { getClientPlatformSync } from '@/utils/sentry/clientPlatform';
/**
 * ブラウザからAPIへのリクエスト時に使用する
 */
import { BaseHttpClient } from './BaseHttpClient';
import type { HttpClientOptions } from './HttpClient';
import { Context } from './type';

export class ClientHttpClient extends BaseHttpClient {
  getContext(): Context {
    return Context.CLIENT;
  }

  /**
   * トークン無効化時はリダイレクトして永遠に解決しないPromiseを返す
   *
   * @remarks
   * window.location.hrefによるリダイレクトでページが離脱するため、
   * 返却されるPromiseは解決されることを期待しない（後続処理を止める目的）
   *
   * @returns リダイレクトする場合は永遠に解決しないPromise、そうでなければnull
   */
  private checkInvalidToken(json: unknown): Promise<never> | null {
    if (handleInvalidTokenForClient(json)) {
      return createNeverResolvingPromise();
    }
    return null;
  }

  private withClientHeader(headers?: HeadersInit): HeadersInit {
    const client = getClientPlatformSync();
    if (!headers) {
      return { 'x-client-platform': client };
    }
    if (headers instanceof Headers) {
      headers.set('x-client-platform', client);
      return headers;
    }
    if (Array.isArray(headers)) {
      const filtered = headers.filter(
        ([key]) => key.toLowerCase() !== 'x-client-platform',
      );
      return [...filtered, ['x-client-platform', client]];
    }
    return { ...headers, 'x-client-platform': client };
  }

  private mergeHeaders(
    base: Record<string, string>,
    headers?: HeadersInit,
  ): HeadersInit {
    if (!headers) {
      return this.withClientHeader(base);
    }
    if (headers instanceof Headers) {
      for (const [key, value] of Object.entries(base)) {
        headers.set(key, value);
      }
      return this.withClientHeader(headers);
    }
    if (Array.isArray(headers)) {
      return this.withClientHeader([...headers, ...Object.entries(base)]);
    }
    return this.withClientHeader({ ...base, ...headers });
  }

  async get<T>(url: string, options?: HttpClientOptions): Promise<T> {
    const { timeoutMs, ...restOptions } = options ?? {};
    const res = await this.timeoutFetch(
      url,
      {
        method: 'GET',
        ...restOptions,
        headers: this.withClientHeader(restOptions.headers),
      },
      timeoutMs,
    );

    const json = await res.json();

    // トークン無効化時はリダイレクトして処理を止める
    const redirectPromise = this.checkInvalidToken(json);
    if (redirectPromise) {
      return redirectPromise;
    }

    return json as T;
  }

  async post<T>(
    url: string,
    body: object,
    options?: HttpClientOptions,
  ): Promise<T> {
    const { timeoutMs, ...restOptions } = options ?? {};
    const headers = this.mergeHeaders(
      { 'Content-Type': 'application/json' },
      restOptions.headers,
    );

    const res = await this.timeoutFetch(
      url,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
        ...restOptions,
      },
      timeoutMs,
    );

    const json = await res.json();

    // トークン無効化時はリダイレクトして処理を止める
    const redirectPromise = this.checkInvalidToken(json);
    if (redirectPromise) {
      return redirectPromise;
    }

    return json as T;
  }

  /**
   * POSTリクエストを送信してRaw Responseを返す（ストリーミング用）
   *
   * NDJSONストリーミングなどでResponse bodyを直接読む必要がある場合に使用
   *
   * @param url リクエストURL
   * @param body リクエストボディ
   * @param options HTTPクライアントオプション
   * @returns Raw Response オブジェクト
   */
  async postStream(
    url: string,
    body: object,
    options?: HttpClientOptions,
  ): Promise<Response> {
    const { timeoutMs, ...restOptions } = options ?? {};
    const headers = this.mergeHeaders(
      { 'Content-Type': 'application/json' },
      restOptions.headers,
    );

    const res = await this.timeoutFetch(
      url,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
        ...restOptions,
      },
      timeoutMs,
    );

    return res;
  }
}
