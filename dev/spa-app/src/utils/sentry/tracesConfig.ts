/**
 * Sentry tracesSampler 共通設定
 *
 * client / server 両方の Sentry 設定で使用するトレース対象パスと
 * サンプラー関数を一元管理する。
 * 新しいページをトレース対象に追加する場合はここだけ変更すればよい。
 */

export const SENTRY_TRACE_TARGET_PATHS = [
  '/girls/all',
  '/profile/unbroadcaster/',
  '/profile/live-broadcaster/',
] as const;

/** トレース対象ページのサンプリングレート（5%） */
export const SENTRY_TRACE_SAMPLE_RATE = 0.05;

/** 非対象ページのサンプリングレート（5%・profiler導入前と同水準） */
export const SENTRY_NON_TARGET_TRACE_RATE = 0.05;

const isTarget = (s: string): boolean =>
  SENTRY_TRACE_TARGET_PATHS.some((path) => s.includes(path));

/**
 * tracesSampler 関数を生成する。
 * 対象パスは SENTRY_TRACE_SAMPLE_RATE を返し、それ以外は SENTRY_NON_TARGET_TRACE_RATE を返す。
 *
 * @param sampleRate - 対象パスのサンプリングレート（デフォルト: SENTRY_TRACE_SAMPLE_RATE）
 */
export const createSentryTracesSampler =
  (sampleRate = SENTRY_TRACE_SAMPLE_RATE) =>
  (samplingContext: {
    name?: string;
    normalizedRequest?: { url?: string };
  }): number => {
    const name = samplingContext.name ?? '';
    const url = samplingContext.normalizedRequest?.url ?? '';
    return isTarget(name) || isTarget(url)
      ? sampleRate
      : SENTRY_NON_TARGET_TRACE_RATE;
  };
