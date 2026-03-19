// Renka iOS/Android DSNはここに設定してください。
export const SENTRY_DSN = {
  WEB: 'https://eb265332d8f144426dad1874706a04d8@o1290367.ingest.us.sentry.io/4508918548070400',
  RENKA_IOS:
    'https://79ab10e44567089ac4fd719c145f9dbd@o1290367.ingest.us.sentry.io/4510938869006336',
  RENKA_ANDROID:
    'https://685cfc323a4fda0830e8d2a5d1e2e261@o1290367.ingest.us.sentry.io/4510938870513664',
} as const;

export const SENTRY_SERVER_DSN = SENTRY_DSN.WEB;
