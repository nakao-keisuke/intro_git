/**
 * フリーマーケット商品カテゴリの定義
 *
 * 女性側（出品者側）で使用されている5つのカテゴリに対応
 */
export const FLEA_MARKET_CATEGORIES = {
  panties: 'パンティー',
  bras: 'ブラジャー',
  bra_and_panty_set: 'パンティー＆ブラのセット',
  clothing: '衣類',
  other: 'その他',
} as const;

export type FleaMarketCategoryKey = keyof typeof FLEA_MARKET_CATEGORIES;
export type FleaMarketCategoryLabel =
  (typeof FLEA_MARKET_CATEGORIES)[FleaMarketCategoryKey];

/**
 * カテゴリキーを日本語ラベルに変換する
 *
 * @param category - カテゴリキー（例: 'panties', 'bras'）
 * @returns 日本語ラベル（例: 'パンティー', 'ブラジャー'）、未定義のカテゴリの場合は元の値を返す
 */
export function getCategoryLabel(category: string): string {
  return FLEA_MARKET_CATEGORIES[category as FleaMarketCategoryKey] ?? category;
}
