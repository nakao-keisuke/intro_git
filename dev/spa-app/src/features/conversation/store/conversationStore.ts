import { create } from 'zustand';
import type { ConversationTabKey } from '@/app/[locale]/(tab-layout)/conversation/constants/tabs';

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
 * 編集モード状態
 */
export type ConversationEditModeState = {
  isEditMode: boolean;
  selectedIds: string[]; // 選択されたチャットのfrdId配列
};

/**
 * 会話関連の状態管理ストア
 *
 * Phase 8: conversationAtoms.ts から移行
 * - partnerCachedDataAtom → partnerCachedData
 * - conversationEditModeAtom → editMode
 * - swiperActiveIndexAtom → swiperActiveIndex
 */
type ConversationStoreState = {
  // State
  /** パートナー追加データキャッシュ */
  partnerCachedData: Map<string, PartnerCachedData>;
  /** 編集モード状態 */
  editMode: ConversationEditModeState;
  /** スワイプ中のアクティブタブインデックス（nullの場合はpathnameに従う） */
  swiperActiveIndex: number | null;
  /** アクティブタブのキー */
  activeTab: ConversationTabKey;

  // Actions
  /** パートナーデータをキャッシュに追加 */
  setPartnerCachedData: (partnerId: string, data: PartnerCachedData) => void;
  /** パートナーデータをキャッシュから取得 */
  getPartnerCachedData: (partnerId: string) => PartnerCachedData | undefined;
  /** パートナーデータキャッシュをクリア */
  clearPartnerCachedData: () => void;
  /** 編集モードを開始 */
  enterEditMode: () => void;
  /** 編集モードを終了 */
  exitEditMode: () => void;
  /** 会話を選択/選択解除 */
  toggleConversationSelection: (frdId: string) => void;
  /** 選択されたすべての会話を選択解除 */
  clearAllSelections: () => void;
  /** スワイプインデックスを設定 */
  setSwiperActiveIndex: (index: number | null) => void;
  /** アクティブタブを設定 */
  setActiveTab: (tab: ConversationTabKey) => void;
};

export const useConversationStore = create<ConversationStoreState>()(
  (set, get) => ({
    // Initial state
    partnerCachedData: new Map(),
    editMode: { isEditMode: false, selectedIds: [] },
    swiperActiveIndex: null,
    activeTab: 'all',

    // Actions
    setPartnerCachedData: (partnerId, data) =>
      set((state) => {
        const newMap = new Map(state.partnerCachedData);
        newMap.set(partnerId, data);
        return { partnerCachedData: newMap };
      }),

    getPartnerCachedData: (partnerId) => get().partnerCachedData.get(partnerId),

    clearPartnerCachedData: () => set({ partnerCachedData: new Map() }),

    enterEditMode: () =>
      set({ editMode: { isEditMode: true, selectedIds: [] } }),

    exitEditMode: () =>
      set({ editMode: { isEditMode: false, selectedIds: [] } }),

    toggleConversationSelection: (frdId) =>
      set((state) => {
        const currentIds = state.editMode.selectedIds;
        const isSelected = currentIds.includes(frdId);
        const newIds = isSelected
          ? currentIds.filter((id) => id !== frdId)
          : [...currentIds, frdId];
        return {
          editMode: { ...state.editMode, selectedIds: newIds },
        };
      }),

    clearAllSelections: () =>
      set((state) => ({
        editMode: { ...state.editMode, selectedIds: [] },
      })),

    setSwiperActiveIndex: (index) => set({ swiperActiveIndex: index }),

    setActiveTab: (tab) => set({ activeTab: tab }),
  }),
);
