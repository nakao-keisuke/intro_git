/**
 * サーバーから送信される翻訳フォーマットをパースするユーティリティ
 *
 * フォーマット: 元メッセージ\n──────\n翻訳メッセージ
 * セパレーター: ──────（罫線文字6個）
 */

// セパレーター: ──────（罫線文字6個）
const TRANSLATION_SEPARATOR = '──────';

/**
 * 翻訳メッセージのパース結果
 */
export type ParsedTranslatedMessage = {
  /** 原文メッセージ */
  rawContent: string;
  /** 翻訳されたメッセージ（翻訳がない場合はnull） */
  translated: string | null;
  /** 翻訳が存在するかどうか */
  hasTranslation: boolean;
};

/**
 * サーバーから送信される翻訳フォーマットをパースする
 *
 * @param content - サーバーから受信したメッセージ内容
 * @returns パース結果（原文、翻訳、翻訳有無）
 *
 * @example
 * // 翻訳あり
 * parseTranslatedMessage("Hello\n──────\nこんにちは")
 * // => { rawContent: "Hello", translated: "こんにちは", hasTranslation: true }
 *
 * @example
 * // 翻訳なし
 * parseTranslatedMessage("Hello")
 * // => { rawContent: "Hello", translated: null, hasTranslation: false }
 */
export const parseTranslatedMessage = (
  content: string,
): ParsedTranslatedMessage => {
  if (!content || !content.includes(TRANSLATION_SEPARATOR)) {
    return {
      rawContent: content || '',
      translated: null,
      hasTranslation: false,
    };
  }

  // 改行区切りで分割（標準フォーマット: "原文\n──────\n翻訳"）
  const fullSeparator = `\n${TRANSLATION_SEPARATOR}\n`;
  const parts = content.split(fullSeparator);

  if (parts.length >= 2) {
    const rawContent = parts[0] ?? '';
    const translated = parts.slice(1).join(fullSeparator);
    return {
      rawContent,
      translated: translated || null,
      hasTranslation: !!translated,
    };
  }

  // セパレーターはあるが改行が含まれていないパターン（フォールバック）
  const simpleParts = content.split(TRANSLATION_SEPARATOR);
  if (simpleParts.length >= 2) {
    const rawContent = (simpleParts[0] ?? '').trim();
    const translated = simpleParts.slice(1).join(TRANSLATION_SEPARATOR).trim();
    return {
      rawContent,
      translated: translated || null,
      hasTranslation: !!translated,
    };
  }

  return { rawContent: content, translated: null, hasTranslation: false };
};

/**
 * 会話一覧表示用に翻訳部分を除去して原文のみを返す
 *
 * @param content - サーバーから受信したメッセージ内容
 * @returns 原文のみ（翻訳部分は除去）
 */
export const stripTranslation = (content: string): string => {
  if (!content || !content.includes(TRANSLATION_SEPARATOR)) {
    return content || '';
  }

  const fullSeparator = `\n${TRANSLATION_SEPARATOR}\n`;
  const separatorIndex = content.indexOf(fullSeparator);
  if (separatorIndex !== -1) {
    return content.slice(0, separatorIndex);
  }

  // フォールバック: 改行なしのセパレーター
  const simpleSeparatorIndex = content.indexOf(TRANSLATION_SEPARATOR);
  if (simpleSeparatorIndex !== -1) {
    return content.slice(0, simpleSeparatorIndex).trim();
  }

  return content;
};
