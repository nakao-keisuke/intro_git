import { create } from 'zustand';

/**
 * パートナーの追加データ（メッセージ一覧から詳細へ引き継ぐデータ）
 */
export type PartnerCachedData = {
  isOnline: boolean;
  isNew?: boolean;
  age?: number;
  region: string;
  hasLovense: boolean;
};

/**
 * 編集モード状態管理
 */
export type ConversationEditModeState = {
  isEditMode: boolean;
  selectedIds: string[]; // 選択されたチャットのfrdId配列
};

/**
 * 会話一覧関連の状態管理
 */
type ConversationState = {
  // State
  /** パートナー追加データキャッシュ */
  partnerCachedData: Map<string, PartnerCachedData>;
  /** 編集モード状態 */
  editMode: ConversationEditModeState;
  /** スワイプ中のアクティブタブインデックス（nullの場合はpathnameに従う） */
  swiperActiveIndex: number | null;

  // Actions
  /** パートナーデータを設定 */
  setPartnerCachedData: (partnerId: string, data: PartnerCachedData) => void;
  /** パートナーデータを取得 */
  getPartnerCachedData: (partnerId: string) => PartnerCachedData | undefined;
  /** パートナーデータをクリア */
  clearPartnerCachedData: () => void;
  /** 編集モードを開始 */
  startEditMode: () => void;
  /** 編集モードを終了 */
  endEditMode: () => void;
  /** 選択IDを追加 */
  addSelectedId: (id: string) => void;
  /** 選択IDを削除 */
  removeSelectedId: (id: string) => void;
  /** 選択IDをトグル */
  toggleSelectedId: (id: string) => void;
  /** 選択IDをクリア */
  clearSelectedIds: () => void;
  /** スワイプアクティブインデックスを設定 */
  setSwiperActiveIndex: (index: number | null) => void;
};

export const useConversationStore = create<ConversationState>()((set, get) => ({
  // Initial state
  partnerCachedData: new Map(),
  editMode: { isEditMode: false, selectedIds: [] },
  swiperActiveIndex: null,

  // Actions
  setPartnerCachedData: (partnerId, data) =>
    set((state) => {
      const newMap = new Map(state.partnerCachedData);
      newMap.set(partnerId, data);
      return { partnerCachedData: newMap };
    }),

  getPartnerCachedData: (partnerId) => get().partnerCachedData.get(partnerId),

  clearPartnerCachedData: () => set({ partnerCachedData: new Map() }),

  startEditMode: () => set({ editMode: { isEditMode: true, selectedIds: [] } }),

  endEditMode: () => set({ editMode: { isEditMode: false, selectedIds: [] } }),

  addSelectedId: (id) =>
    set((state) => ({
      editMode: {
        ...state.editMode,
        selectedIds: [...state.editMode.selectedIds, id],
      },
    })),

  removeSelectedId: (id) =>
    set((state) => ({
      editMode: {
        ...state.editMode,
        selectedIds: state.editMode.selectedIds.filter((i) => i !== id),
      },
    })),

  toggleSelectedId: (id) =>
    set((state) => {
      const isSelected = state.editMode.selectedIds.includes(id);
      return {
        editMode: {
          ...state.editMode,
          selectedIds: isSelected
            ? state.editMode.selectedIds.filter((i) => i !== id)
            : [...state.editMode.selectedIds, id],
        },
      };
    }),

  clearSelectedIds: () =>
    set((state) => ({
      editMode: { ...state.editMode, selectedIds: [] },
    })),

  setSwiperActiveIndex: (index) => set({ swiperActiveIndex: index }),
}));
