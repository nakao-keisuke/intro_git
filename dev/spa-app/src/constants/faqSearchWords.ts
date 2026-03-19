export type FaqSearchWord = {
  label: string;
  icon: '📱' | '👩' | '👤' | '🎁' | '🔰' | '💰' | '🔍' | '🛒';
  categorySlug?: string;
  searchTerm?: string;
};

export const FAQ_SEARCH_WORDS: ReadonlyArray<FaqSearchWord> = [
  { label: '遊び方', icon: '🔰', categorySlug: 'beginner' },
  { label: 'アカウント', icon: '👤', categorySlug: 'account' },
  { label: 'カメラ・マイク', icon: '📱', categorySlug: 'connection' },
  { label: '女の子', icon: '👩', categorySlug: 'girls' },
  { label: '無料ポイント', icon: '🎁', categorySlug: 'benefits' },
  { label: '料金', icon: '💰', categorySlug: 'point' },
  { label: 'フリマ', icon: '🛒', categorySlug: 'fleamarket' },
];
