import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { POLLING } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type {
  NdjsonDataLine,
  NdjsonLine,
  PollingResult,
  UsePollingOptions,
} from '@/services/polling/types';

/**
 * NDJSONストリーミングレスポンスをパースする
 *
 * @param response fetch Response オブジェクト
 * @returns パース済みのポーリング結果
 */
async function parseNdjsonStream(response: Response): Promise<PollingResult> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Response body is not readable');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  const result: PollingResult = {};

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      // デコードしてバッファに追加
      buffer += decoder.decode(value, { stream: true });

      // 改行で分割して各行を処理
      const lines = buffer.split('\n');

      // 最後の行は不完全な可能性があるので保持
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const parsed = JSON.parse(line) as NdjsonLine;

          // 終了行はスキップ
          if ('type' in parsed && parsed.type === 'end') {
            continue;
          }

          // データ行を処理
          const dataLine = parsed as NdjsonDataLine;
          result[dataLine.key] = dataLine.ok
            ? { data: dataLine.data }
            : { error: dataLine.error };
        } catch (parseError) {
          console.error('Failed to parse NDJSON line:', line, parseError);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return result;
}

/**
 * ポーリング統合API を使用するカスタムフック
 *
 * 複数のタスクを並列実行し、NDJSONストリーミングで結果を取得する
 *
 * @param options ポーリングオプション
 * @returns React Query の結果オブジェクト
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePolling({
 *   tasks: [
 *     { key: 'unreadCount' },
 *     { key: 'liveUsers', params: { token: 'abc' } }
 *   ],
 *   refetchInterval: 3000, // 3秒ごとにポーリング
 *   enabled: !!userToken,
 * });
 *
 * // 未読数を取得
 * const unreadCount = data?.unreadCount?.data;
 * // エラーを確認
 * const unreadError = data?.unreadCount?.error;
 * ```
 */
export function usePolling({
  tasks,
  refetchInterval = 3000,
  refetchIntervalInBackground = true,
  refetchOnWindowFocus = true,
  enabled = true,
  queryOptions,
}: UsePollingOptions) {
  const clientHttpClient = useMemo(() => new ClientHttpClient(), []);

  // タスクのkeyリストを安定化してクエリキーに使用（キャッシュエントリの無限増殖を防止）
  // tasks は毎レンダーで新しい配列なので、key+params の文字列表現で比較
  const stableQueryKey =
    tasks.length === 0
      ? 'empty'
      : tasks
          .map((t) => `${t.key}:${JSON.stringify(t.params ?? {})}`)
          .sort()
          .join(',');

  return useQuery<PollingResult>({
    queryKey: ['polling', stableQueryKey],
    queryFn: async () => {
      // POSTリクエストを送信（Raw Response取得）
      const response = await clientHttpClient.postStream(
        POLLING,
        { tasks },
        { timeoutMs: 10000 }, // 全タスク完了を待つため長めのタイムアウト
      );

      // エラーレスポンスの処理
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Polling request failed');
      }

      // NDJSONストリーミングをパース
      return await parseNdjsonStream(response);
    },
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnWindowFocus,
    enabled: enabled && tasks.length > 0,
    staleTime: 0, // 常に最新データを取得
    ...queryOptions,
  });
}
