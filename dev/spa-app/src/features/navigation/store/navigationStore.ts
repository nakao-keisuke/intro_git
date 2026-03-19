import { create } from 'zustand';
import type { NavEntry, NavOrigin, NavState, NavTo } from '@/types/navigation';

/**
 * ナビゲーション関連の状態管理ストア
 *
 * Phase 8: navigationAtom.ts から移行
 * - navigationState → state
 */
type NavigationStoreState = {
  // State
  /** ナビゲーション状態 */
  state: NavState;

  // Actions
  /** 現在のURL情報を設定 */
  setCurrent: (current: NavTo | null) => void;
  /** 遷移情報を記録 */
  setLastEntry: (entry: NavEntry | null) => void;
  /** 次の遷移に付与する情報を設定 */
  setPending: (pending: { origin: NavOrigin; to?: NavTo } | null) => void;
  /** 遷移を完了（pendingをlastEntryに移動） */
  completeNavigation: (to: NavTo) => void;
  /** ナビゲーション状態をリセット */
  resetNavigationState: () => void;
  /** ナビゲーション状態を一括更新 */
  updateNavigationState: (updates: Partial<NavState>) => void;
};

const initialNavState: NavState = {
  current: null,
  lastEntry: null,
  pending: null,
};

export const useNavigationStore = create<NavigationStoreState>()(
  (set, get) => ({
    // Initial state
    state: initialNavState,

    // Actions
    setCurrent: (current) =>
      set((s) => ({
        state: { ...s.state, current },
      })),

    setLastEntry: (entry) =>
      set((s) => ({
        state: { ...s.state, lastEntry: entry },
      })),

    setPending: (pending) =>
      set((s) => ({
        state: { ...s.state, pending },
      })),

    completeNavigation: (to) => {
      const { state } = get();
      if (state.pending) {
        const newEntry: NavEntry = {
          to,
          origin: state.pending.origin,
        };
        set({
          state: {
            current: to,
            lastEntry: newEntry,
            pending: null,
          },
        });
      } else {
        set((s) => ({
          state: { ...s.state, current: to },
        }));
      }
    },

    resetNavigationState: () => set({ state: initialNavState }),

    updateNavigationState: (updates) =>
      set((s) => ({
        state: { ...s.state, ...updates },
      })),
  }),
);
