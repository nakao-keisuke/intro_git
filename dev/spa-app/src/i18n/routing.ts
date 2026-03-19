import { defineRouting } from 'next-intl/routing';

export const locales = [
  'ja',
  'en',
  'ko',
  'zh-TW',
  'zh-HK',
  'de',
  'fr',
  'it',
  'tr',
] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'ja',
  localePrefix: 'as-needed',
});
