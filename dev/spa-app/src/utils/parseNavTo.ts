import type { NavTo } from '@/types/navigation';

/**
 * URL文字列をNavTo形式に分解するユーティリティ関数
 *
 * @param input - 相対URL文字列（例: "/path?x=1"）
 * @returns NavTo形式のオブジェクト
 *
 * @example
 * parseNavTo("/blog?page=2")
 * // => { pathname: "/blog", search: "?page=2", fullPath: "/blog?page=2" }
 *
 * parseNavTo("/about")
 * // => { pathname: "/about" }
 */
export function parseNavTo(input: string): NavTo {
  const searchIndex = input.indexOf('?');

  let pathname = input;
  let search: string | undefined;

  // クエリパラメータを抽出
  if (searchIndex >= 0) {
    search = input.slice(searchIndex);
    pathname = input.slice(0, searchIndex);
  }

  // fullPathはsearchがある場合のみ生成
  const fullPath = search ? `${pathname}${search}` : undefined;

  return {
    pathname,
    ...(search && { search }),
    ...(fullPath && { fullPath }),
  };
}
