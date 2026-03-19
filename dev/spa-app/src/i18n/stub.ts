// i18n stub - placeholder until full i18n is implemented
// Returns the key as-is for now

type TranslationFunction = (key: string, params?: Record<string, unknown>) => string

export function useTranslations(_namespace?: string): TranslationFunction {
  return (key: string, _params?: Record<string, unknown>) => key
}

export function getTranslations(_namespace?: string): Promise<TranslationFunction> {
  return Promise.resolve((key: string, _params?: Record<string, unknown>) => key)
}

export function useLocale(): string {
  return 'ja'
}

export function useMessages(): Record<string, unknown> {
  return {}
}

export const locales = ['ja', 'en', 'ko', 'zh-TW', 'zh-HK', 'de', 'fr', 'it', 'tr'] as const
export const defaultLocale = 'ja'
