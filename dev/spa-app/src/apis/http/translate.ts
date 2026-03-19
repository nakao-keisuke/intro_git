import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

/**
 * Route Handler ⇔ jambo-server リクエスト定義（snake_case）
 */
export type TranslateRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.TRANSLATE;
  readonly token: string;
  readonly original_text: string;
  readonly target_language?: string; // デフォルト "ja"
};

/**
 * jambo-server レスポンス定義
 */
export type TranslateUpstreamResponse = APIResponse<{
  readonly original_text: string;
  readonly translated_text: string;
  readonly target_language: string;
  readonly detected_source_language: string;
}>;

/**
 * client ⇔ Route Handler レスポンス（CamelCase）
 */
export type TranslateResult = {
  readonly originalText: string;
  readonly translatedText: string;
  readonly targetLanguage: string;
  readonly detectedSourceLanguage: string;
};

export type TranslateRouteResponse = ApiRouteResponse<TranslateResult>;

/**
 * リクエスト作成関数
 */
export const createTranslateRequest = (
  token: string,
  originalText: string,
  targetLanguage = 'ja',
): TranslateRequest => ({
  api: JAMBO_API_ROUTE.TRANSLATE,
  token,
  original_text: originalText,
  target_language: targetLanguage,
});
