import { useCallback, useMemo } from 'react';
import type { TranslateRouteResponse } from '@/apis/http/translate';
import { HTTP_TRANSLATE } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

/**
 * ユーザーの言語が日本語かどうかを判定
 * navigator.languages（優先言語リスト）とnavigator.languageの両方をチェック
 */
const isJapaneseUser = (): boolean => {
  if (typeof navigator === 'undefined') return true;

  // navigator.languagesが存在する場合、優先言語リストをチェック
  if (navigator.languages?.length > 0) {
    return navigator.languages.some((lang) => lang.startsWith('ja'));
  }

  // フォールバック: navigator.languageをチェック
  const lang = navigator.language || '';
  return lang.startsWith('ja');
};

/**
 * 翻訳用カスタムフック
 *
 * 配信コメント送信時に使用。
 * ユーザーの言語が日本語以外の場合、コメントを日本語に翻訳する。
 */
export const useTranslate = () => {
  const client = useMemo(() => new ClientHttpClient(), []);

  /**
   * テキストを日本語に翻訳する
   * - ユーザーが日本語の場合は翻訳せずそのまま返す
   * - 翻訳APIがエラーの場合は元のテキストを返す
   *
   * @param text 翻訳対象のテキスト
   * @returns 翻訳後のテキスト（または元のテキスト）
   */
  const translateToJapanese = useCallback(
    async (text: string): Promise<string> => {
      // 日本語ユーザーは翻訳不要
      if (isJapaneseUser()) {
        return text;
      }

      // 空文字は翻訳不要
      if (!text.trim()) {
        return text;
      }

      try {
        const response = await client.post<TranslateRouteResponse>(
          HTTP_TRANSLATE,
          { originalText: text },
        );

        if (response.type === 'success' && response.data?.translatedText) {
          return response.data.translatedText;
        }

        // 翻訳失敗時は元のテキストを返す
        return text;
      } catch {
        // エラー時は元のテキストを返す
        return text;
      }
    },
    [client],
  );

  return {
    translateToJapanese,
    isJapaneseUser,
  };
};
