/**
 * Adjust Web SDK の型定義
 */
declare global {
  interface Window {
    Adjust?: {
      trackEvent: (eventConfig: AdjustEventConfig) => void;
      addGlobalCallbackParameters: (
        params: Array<{ key: string; value: string }>,
      ) => void;
      initSdk: (config: AdjustConfig) => void;
    };
  }
}

/**
 * Adjustイベント設定の型定義
 */
export type AdjustEventConfig = {
  eventToken: string;
  callbackParams?: Array<{ key: string; value: string }>;
  partnerParams?: Array<{ key: string; value: string }>;
};

/**
 * Adjust SDK設定の型定義
 */
export type AdjustConfig = {
  appToken: string;
  environment: 'production' | 'sandbox';
  logLevel?: 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'assert';
};
