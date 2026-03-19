import { create } from 'zustand';
import type { ConversationListResponse } from '@/services/conversation/type';
import type {
  QuickJoinBookmarkStreamInfo,
  TaskResult,
} from '@/services/polling/types';
import type { LiveChannels } from '@/services/shared/type';
import type { NewChat } from '@/types/NewChat';

type PollingState = {
  // Polling data
  unreadCount: TaskResult<number> | null;
  myPoint: TaskResult<{ point: number }> | null;
  liveUsers: TaskResult<LiveChannels> | null;
  listConversation: TaskResult<ConversationListResponse> | null;
  incomingCall: TaskResult | null;
  newChat: TaskResult | null;
  bookmarkStreamInfo: TaskResult<QuickJoinBookmarkStreamInfo> | null;
  utagePolling: TaskResult<NewChat[]> | null;
  chatHistory: TaskResult | null;

  // Toast queue
  utageToastQueue: NewChat[];

  // Timestamp for utagePolling (localStorage sync)
  utagePollingLatestTimeStamp: string | undefined;

  // App toast notification setting (localStorage sync)
  enableAppToast: boolean;

  // ChatHistory polling config (dynamic control)
  chatHistoryPollingConfig: {
    enabled: boolean;
    partnerId?: string | undefined;
  };

  // Actions
  setUnreadCount: (data: TaskResult<number> | null) => void;
  setMyPoint: (data: TaskResult<{ point: number }> | null) => void;
  setLiveUsers: (data: TaskResult<LiveChannels> | null) => void;
  setListConversation: (
    data: TaskResult<ConversationListResponse> | null,
  ) => void;
  setIncomingCall: (data: TaskResult | null) => void;
  setNewChat: (data: TaskResult | null) => void;
  setBookmarkStreamInfo: (
    data: TaskResult<QuickJoinBookmarkStreamInfo> | null,
  ) => void;
  setUtagePolling: (data: TaskResult<NewChat[]> | null) => void;
  setChatHistory: (data: TaskResult | null) => void;

  // Bulk update for performance
  updatePollingData: (
    updates: Partial<
      Pick<
        PollingState,
        | 'unreadCount'
        | 'myPoint'
        | 'liveUsers'
        | 'listConversation'
        | 'incomingCall'
        | 'newChat'
        | 'bookmarkStreamInfo'
        | 'utagePolling'
        | 'chatHistory'
      >
    >,
  ) => void;

  // Toast queue management
  addToToastQueue: (chat: NewChat) => void;
  removeFromToastQueue: () => void;
  clearToastQueue: () => void;

  // Timestamp management
  setUtagePollingLatestTimeStamp: (timestamp: string | undefined) => void;

  // App toast setting management (syncs to localStorage)
  setEnableAppToast: (enabled: boolean) => void;

  // ChatHistory config management
  setChatHistoryPollingConfig: (config: {
    enabled: boolean;
    partnerId?: string | undefined;
  }) => void;

  // Member count (ライブ視聴者数の更新トリガー)
  memberCountUpdated: number;
  setMemberCountUpdated: (count: number) => void;
  incrementMemberCountUpdated: () => void;

  // 未読数更新フラグ（通知一覧の再取得トリガー）
  isNeedToUpdateUnreadCount: boolean;
  setIsNeedToUpdateUnreadCount: (value: boolean) => void;
  triggerUnreadCountUpdate: () => void;
};

export const usePollingStore = create<PollingState>()((set) => ({
  // Initial state
  unreadCount: null,
  myPoint: null,
  liveUsers: null,
  listConversation: null,
  incomingCall: null,
  newChat: null,
  bookmarkStreamInfo: null,
  utagePolling: null,
  chatHistory: null,
  utageToastQueue: [],
  utagePollingLatestTimeStamp: undefined,
  enableAppToast:
    typeof window !== 'undefined'
      ? localStorage.getItem('enableNotifications') !== 'false'
      : true,
  chatHistoryPollingConfig: {
    enabled: false,
    partnerId: undefined,
  },

  // Actions
  setUnreadCount: (data) => set({ unreadCount: data }),
  setMyPoint: (data) => set({ myPoint: data }),
  setLiveUsers: (data) => set({ liveUsers: data }),
  setListConversation: (data) => set({ listConversation: data }),
  setIncomingCall: (data) => set({ incomingCall: data }),
  setNewChat: (data) => set({ newChat: data }),
  setBookmarkStreamInfo: (data) => set({ bookmarkStreamInfo: data }),
  setUtagePolling: (data) => set({ utagePolling: data }),
  setChatHistory: (data) => set({ chatHistory: data }),

  // Bulk update for performance
  updatePollingData: (updates) => set((state) => ({ ...state, ...updates })),

  // Toast queue
  addToToastQueue: (chat) =>
    set((state) => ({ utageToastQueue: [...state.utageToastQueue, chat] })),
  removeFromToastQueue: () =>
    set((state) => ({ utageToastQueue: state.utageToastQueue.slice(1) })),
  clearToastQueue: () => set({ utageToastQueue: [] }),

  // Timestamp
  setUtagePollingLatestTimeStamp: (timestamp) =>
    set({ utagePollingLatestTimeStamp: timestamp }),

  // App toast setting (syncs to localStorage)
  setEnableAppToast: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('enableNotifications', enabled ? 'true' : 'false');
    }
    set({ enableAppToast: enabled });
  },

  // ChatHistory config
  setChatHistoryPollingConfig: (config) =>
    set({ chatHistoryPollingConfig: config }),

  // Member count
  memberCountUpdated: 0,
  setMemberCountUpdated: (count) => set({ memberCountUpdated: count }),
  incrementMemberCountUpdated: () =>
    set((state) => ({ memberCountUpdated: state.memberCountUpdated + 1 })),

  // 未読数更新フラグ
  isNeedToUpdateUnreadCount: false,
  setIsNeedToUpdateUnreadCount: (value) =>
    set({ isNeedToUpdateUnreadCount: value }),
  triggerUnreadCountUpdate: () =>
    set((state) => ({
      isNeedToUpdateUnreadCount: !state.isNeedToUpdateUnreadCount,
    })),
}));
