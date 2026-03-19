import { create } from 'zustand';

/**
 * お気に入り関連の状態管理ストア
 *
 * Phase 8: favoriteAtoms.ts から移行
 * - favoriteSwiperActiveIndexAtom → swiperActiveIndex
 */
type FavoriteStoreState = {
  // State
  /** スワイプ中のアクティブタブインデックス（nullの場合はlistType状態に従う） */
  swiperActiveIndex: number | null;

  // Actions
  /** スワイプインデックスを設定 */
  setSwiperActiveIndex: (index: number | null) => void;
};

export const useFavoriteStore = create<FavoriteStoreState>()((set) => ({
  // Initial state
  swiperActiveIndex: null,

  // Actions
  setSwiperActiveIndex: (index) => set({ swiperActiveIndex: index }),
}));
