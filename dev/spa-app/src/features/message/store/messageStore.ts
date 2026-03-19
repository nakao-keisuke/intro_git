import { create } from 'zustand';
import type { OptimisticMessage } from '@/types/ChatInfo';

/**
 * メッセージ関連の状態管理ストア
 *
 * Phase 8: atom.ts から移行
 * - optimisticMessagesAtom → optimisticMessages
 */
type MessageStoreState = {
  // State
  /** 楽観的メッセージ（パートナーIDをキー） */
  optimisticMessages: Record<string, OptimisticMessage[]>;

  // Actions
  /** 楽観的メッセージを追加 */
  addOptimisticMessage: (partnerId: string, message: OptimisticMessage) => void;
  /** 楽観的メッセージを削除（送信成功時） */
  removeOptimisticMessage: (partnerId: string, messageId: string) => void;
  /** 楽観的メッセージのステータスを更新 */
  updateOptimisticMessageStatus: (
    partnerId: string,
    messageId: string,
    sendStatus: OptimisticMessage['sendStatus'],
  ) => void;
  /** 特定のパートナーの楽観的メッセージをクリア */
  clearOptimisticMessagesForPartner: (partnerId: string) => void;
  /** すべての楽観的メッセージをクリア */
  clearAllOptimisticMessages: () => void;
  /** 特定のパートナーの楽観的メッセージを取得 */
  getOptimisticMessagesForPartner: (partnerId: string) => OptimisticMessage[];
  /** 楽観的メッセージを一括設定（Recoilからの移行用） */
  setOptimisticMessages: (
    messages: Record<string, OptimisticMessage[]>,
  ) => void;
};

export const useMessageStore = create<MessageStoreState>()((set, get) => ({
  // Initial state
  optimisticMessages: {},

  // Actions
  addOptimisticMessage: (partnerId, message) =>
    set((state) => {
      const currentMessages = state.optimisticMessages[partnerId] || [];
      return {
        optimisticMessages: {
          ...state.optimisticMessages,
          [partnerId]: [...currentMessages, message],
        },
      };
    }),

  removeOptimisticMessage: (partnerId, messageId) =>
    set((state) => {
      const currentMessages = state.optimisticMessages[partnerId] || [];
      const filteredMessages = currentMessages.filter(
        (msg) => msg.id !== messageId,
      );
      return {
        optimisticMessages: {
          ...state.optimisticMessages,
          [partnerId]: filteredMessages,
        },
      };
    }),

  updateOptimisticMessageStatus: (partnerId, messageId, sendStatus) =>
    set((state) => {
      const currentMessages = state.optimisticMessages[partnerId] || [];
      const updatedMessages = currentMessages.map((msg) =>
        msg.id === messageId ? { ...msg, sendStatus } : msg,
      );
      return {
        optimisticMessages: {
          ...state.optimisticMessages,
          [partnerId]: updatedMessages,
        },
      };
    }),

  clearOptimisticMessagesForPartner: (partnerId) =>
    set((state) => {
      const { [partnerId]: _, ...rest } = state.optimisticMessages;
      return { optimisticMessages: rest };
    }),

  clearAllOptimisticMessages: () => set({ optimisticMessages: {} }),

  getOptimisticMessagesForPartner: (partnerId) =>
    get().optimisticMessages[partnerId] || [],

  setOptimisticMessages: (messages) => set({ optimisticMessages: messages }),
}));
