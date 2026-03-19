import { create } from 'zustand';

/**
 * ライブチャットメッセージの型
 */
export type LiveChatMessage = {
  text: string;
  sender_id?: string | undefined;
  sender_name?: string | undefined;
};

/**
 * ライブ配信関連の状態管理ストア
 *
 * Phase 8: atom.ts から移行
 * - isNeedToRefreshLivePeople → isNeedToRefreshLivePeople
 * - latestLiveChatMessage → latestLiveChatMessage
 * - isLiveChatInputFocusedAtom → isLiveChatInputFocused
 */
type LiveStoreState = {
  // State
  /** ライブ配信者リスト更新フラグ */
  isNeedToRefreshLivePeople: boolean;
  /** 最新ライブチャットメッセージ */
  latestLiveChatMessage: LiveChatMessage;
  /** ライブチャット入力フォーカス状態 */
  isLiveChatInputFocused: boolean;

  // Actions
  /** ライブ配信者リスト更新フラグを設定 */
  setIsNeedToRefreshLivePeople: (isNeeded: boolean) => void;
  /** 最新ライブチャットメッセージを設定 */
  setLatestLiveChatMessage: (message: LiveChatMessage) => void;
  /** ライブチャット入力フォーカス状態を設定 */
  setIsLiveChatInputFocused: (isFocused: boolean) => void;
  /** ライブチャットメッセージをクリア */
  clearLatestLiveChatMessage: () => void;
  /** ライブ状態をリセット */
  resetLiveState: () => void;
};

const defaultLiveChatMessage: LiveChatMessage = {
  text: '',
  sender_id: undefined,
  sender_name: undefined,
};

export const useLiveStore = create<LiveStoreState>()((set) => ({
  // Initial state
  isNeedToRefreshLivePeople: false,
  latestLiveChatMessage: defaultLiveChatMessage,
  isLiveChatInputFocused: false,

  // Actions
  setIsNeedToRefreshLivePeople: (isNeeded) =>
    set({ isNeedToRefreshLivePeople: isNeeded }),

  setLatestLiveChatMessage: (message) =>
    set({ latestLiveChatMessage: message }),

  setIsLiveChatInputFocused: (isFocused) =>
    set({ isLiveChatInputFocused: isFocused }),

  clearLatestLiveChatMessage: () =>
    set({ latestLiveChatMessage: defaultLiveChatMessage }),

  resetLiveState: () =>
    set({
      isNeedToRefreshLivePeople: false,
      latestLiveChatMessage: defaultLiveChatMessage,
      isLiveChatInputFocused: false,
    }),
}));
