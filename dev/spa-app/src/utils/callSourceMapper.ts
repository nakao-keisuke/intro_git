/**
 * 通話発信時のsourceパラメータをpathnameから短いカテゴリ名にマッピング
 *
 * Reproへの送信時に文字数上限を超えないよう、pathnameを短いカテゴリ名に変換する
 */

const SOURCE_MAPPING_RULES: Array<{
  pattern: RegExp;
  mapTo: string;
  description: string;
}> = [
  // プロフィール
  {
    pattern: /^\/profile\//,
    mapTo: 'profile',
    description: 'プロフィールページ',
  },

  // ホーム
  {
    pattern: /^\/girls\/all/,
    mapTo: 'home',
    description: 'ホーム画面',
  },

  // 掲示板
  {
    pattern: /^\/board/,
    mapTo: 'board',
    description: '掲示板',
  },

  // 通話履歴
  {
    pattern: /^\/callhistory-list/,
    mapTo: 'callhistory',
    description: '通話履歴',
  },

  // いいね
  {
    pattern: /^\/favorite-list/,
    mapTo: 'favorite',
    description: 'いいねリスト',
  },

  // お気に入り
  {
    pattern: /^\/bookmark-list/,
    mapTo: 'bookmark',
    description: 'お気に入りリスト',
  },

  // 検索結果
  {
    pattern: /^\/search\/result/,
    mapTo: 'search',
    description: '検索結果',
  },
];

/**
 * pathnameからGA4/Repro用のsource値にマッピング
 *
 * @param pathname - window.location.pathname
 * @returns マッピングされたsource値（マッチしない場合はpathnameをそのまま返す）
 *
 * @example
 * getCallSource('/girls/all/video-call-ranking') // => 'home'
 * getCallSource('/profile/detail/12345') // => 'profile'
 * getCallSource('/favorite-list') // => 'favorite'
 */
export function getCallSource(pathname: string): string {
  for (const rule of SOURCE_MAPPING_RULES) {
    if (rule.pattern.test(pathname)) {
      return rule.mapTo;
    }
  }

  // マッチするルールがない場合はpathnameをそのまま返す
  return pathname;
}
