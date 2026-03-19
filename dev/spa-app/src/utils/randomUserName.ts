import { generateRandomNickName } from '@/constants/randomNickName';
import type { Locale } from '@/i18n/routing';

/**
 * 言語に応じたランダムユーザー名を生成
 * @param locale 言語コード（省略時は日本語）
 * @returns ランダムに選択されたユーザー名
 */
export const generateRandomUserName = (
  locale?: Locale | string | undefined,
): string => {
  return generateRandomNickName(locale);
};
