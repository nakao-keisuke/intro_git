import { create } from 'zustand';

/**
 * 検索条件の型定義
 */
export type SearchConditionsState = {
  activeStatus: string;
  activeChatType: string;
  activeFavorite: string;
  selectedTypes: string[];
  selectedAge: string;
  selectedArea: string;
  selectedBustSize: string;
  activeMaritalStatus: string;
  activeFleaMarket: string;
  nickname: string;
};

/**
 * デフォルトの検索条件
 * Note: locale-independent keys are used for all values.
 * Display labels are resolved via i18n in the UI layer.
 */
const defaultSearchConditions: SearchConditionsState = {
  activeStatus: 'all',
  activeChatType: 'noPreference',
  activeFavorite: 'noPreference',
  selectedTypes: [],
  selectedAge: 'noPreference',
  selectedArea: 'noPreference',
  selectedBustSize: 'noPreference',
  activeMaritalStatus: 'noPreference',
  activeFleaMarket: 'noPreference',
  nickname: '',
};

/**
 * 検索条件関連の状態管理ストア
 *
 * Phase 8: searchConditionsAtom.ts から移行
 * - searchConditionsAtom → conditions
 */
type SearchStoreState = {
  // State
  /** 検索条件 */
  conditions: SearchConditionsState;

  // Actions
  /** 検索条件を設定 */
  setConditions: (conditions: SearchConditionsState) => void;
  /** 検索条件を部分更新 */
  updateConditions: (updates: Partial<SearchConditionsState>) => void;
  /** 検索条件をリセット */
  resetConditions: () => void;
  /** 特定のフィールドを更新 */
  setActiveStatus: (status: string) => void;
  setActiveChatType: (chatType: string) => void;
  setActiveFavorite: (favorite: string) => void;
  setSelectedTypes: (types: string[]) => void;
  setSelectedAge: (age: string) => void;
  setSelectedArea: (area: string) => void;
  setSelectedBustSize: (bustSize: string) => void;
  setActiveMaritalStatus: (maritalStatus: string) => void;
  setActiveFleaMarket: (fleaMarket: string) => void;
  setNickname: (nickname: string) => void;
};

export const useSearchStore = create<SearchStoreState>()((set) => ({
  // Initial state
  conditions: defaultSearchConditions,

  // Actions
  setConditions: (conditions) => set({ conditions }),

  updateConditions: (updates) =>
    set((state) => ({
      conditions: { ...state.conditions, ...updates },
    })),

  resetConditions: () => set({ conditions: defaultSearchConditions }),

  // Field-specific setters
  setActiveStatus: (status) =>
    set((state) => ({
      conditions: { ...state.conditions, activeStatus: status },
    })),

  setActiveChatType: (chatType) =>
    set((state) => ({
      conditions: { ...state.conditions, activeChatType: chatType },
    })),

  setActiveFavorite: (favorite) =>
    set((state) => ({
      conditions: { ...state.conditions, activeFavorite: favorite },
    })),

  setSelectedTypes: (types) =>
    set((state) => ({
      conditions: { ...state.conditions, selectedTypes: types },
    })),

  setSelectedAge: (age) =>
    set((state) => ({
      conditions: { ...state.conditions, selectedAge: age },
    })),

  setSelectedArea: (area) =>
    set((state) => ({
      conditions: { ...state.conditions, selectedArea: area },
    })),

  setSelectedBustSize: (bustSize) =>
    set((state) => ({
      conditions: { ...state.conditions, selectedBustSize: bustSize },
    })),

  setActiveMaritalStatus: (maritalStatus) =>
    set((state) => ({
      conditions: { ...state.conditions, activeMaritalStatus: maritalStatus },
    })),

  setActiveFleaMarket: (fleaMarket) =>
    set((state) => ({
      conditions: { ...state.conditions, activeFleaMarket: fleaMarket },
    })),

  setNickname: (nickname) =>
    set((state) => ({
      conditions: { ...state.conditions, nickname },
    })),
}));
