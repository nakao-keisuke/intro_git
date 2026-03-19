import { create } from 'zustand';
import type { LovenseMenuItem } from '@/apis/http/lovense';
import type {
  LovenseAction,
  LovensePattern,
} from '@/constants/lovenseSequences';

/**
 * Lovenseの状態型
 */
export type LovenseStateData = {
  ticketCount: number;
  isPlayedToday: boolean;
  isCampaignActive: boolean;
  menuItems: LovenseMenuItem[];
  lastPlayedDate: string | null; // YYYY-MM-DD形式
};

export type LovenseRtmUpdate = {
  intensity: number;
  duration: number;
  updatedAt: number;
  senderId?: string;
  expiresAt?: number; // TTL管理用: expiration timestamp (ms)
};

export type LovenseRtmUpdateMessage = {
  type: 'lovense.update';
  intensity: number;
  duration: number;
};

/**
 * シーケンスのフェーズ
 */
export type SequencePhase =
  | 'idle' // 待機中
  | 'countdown' // カウントダウン中
  | 'activation' // Lovense発動中
  | 'waiting' // 次のアクションまでの待機中
  | 'completed'; // 完了

/**
 * 現在実行中のシーケンスの状態
 */
export type SequenceState = {
  /** シーケンスが実行中かどうか */
  isRunning: boolean;
  /** 選択されたパターン */
  pattern: LovensePattern | null;
  /** 現在のアクションインデックス（0始まり） */
  currentActionIndex: number;
  /** 現在のフェーズ */
  phase: SequencePhase;
  /** カウントダウン残り秒数 */
  countdown: number;
  /** 発動残り秒数 */
  activationRemaining: number;
  /** 待機残り秒数 */
  waitingRemaining: number;
  /** 現在のアクション情報 */
  currentAction: LovenseAction | null;
  /** activationフェーズの終了予定時刻（タイムスタンプ） */
  activationEndTime: number | null;
};

/**
 * 今日の日付を取得（YYYY-MM-DD形式）
 */
const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0] as string;
};

/**
 * デフォルトのLovense状態
 */
const defaultLovenseState: LovenseStateData = {
  ticketCount: 0,
  isPlayedToday: false,
  isCampaignActive: false,
  menuItems: [],
  lastPlayedDate: null,
};

/**
 * デフォルトのシーケンス状態
 */
export const defaultSequenceState: SequenceState = {
  isRunning: false,
  pattern: null,
  currentActionIndex: 0,
  phase: 'idle',
  countdown: 0,
  activationRemaining: 0,
  waitingRemaining: 0,
  currentAction: null,
  activationEndTime: null,
};

/**
 * Lovense関連の状態管理ストア
 *
 * Phase 8: lovenseAtom.ts, lovenseSequenceAtom.ts から移行
 * - lovenseStateAtom → lovenseState (localStorage永続化)
 * - lovenseSequenceStateAtom → sequenceState
 * - autoLovenseSequenceTriggeredAtom → autoSequenceTriggered
 * - lovenseSequenceCompletedAtom → sequenceCompleted (sessionStorage永続化)
 */
type LovenseStoreState = {
  // State
  /** Lovenseルーレット状態 */
  lovenseState: LovenseStateData;
  /** シーケンス実行状態 */
  sequenceState: SequenceState;
  /** 自動シーケンストリガーフラグ */
  autoSequenceTriggered: boolean;
  /** シーケンス完了した配信者ID (sessionStorageに永続化、異なる配信者ならリセット) */
  sequenceCompletedPeerId: string | null;
  /** RTMから受信した完全コントロール更新 */
  rtmLovenseUpdate: LovenseRtmUpdate | null;

  // Actions - Lovense State
  /** Lovense状態を設定 */
  setLovenseState: (state: LovenseStateData) => void;
  /** Lovense状態を部分更新 */
  updateLovenseState: (updates: Partial<LovenseStateData>) => void;
  /** チケット数を設定 */
  setTicketCount: (count: number) => void;
  /** 本日プレイ済みを設定 */
  setIsPlayedToday: (played: boolean) => void;
  /** キャンペーン状態を設定 */
  setIsCampaignActive: (active: boolean) => void;
  /** メニューアイテムを設定 */
  setMenuItems: (items: LovenseMenuItem[]) => void;
  /** 日付変更チェック（isPlayedTodayをリセット） */
  checkDateChange: () => void;

  // Actions - Sequence State
  /** シーケンス状態を設定 */
  setSequenceState: (state: SequenceState) => void;
  /** シーケンス状態を部分更新 */
  updateSequenceState: (updates: Partial<SequenceState>) => void;
  /** シーケンスをリセット */
  resetSequence: () => void;
  /** 自動シーケンストリガーを設定 */
  setAutoSequenceTriggered: (triggered: boolean) => void;
  /** シーケンス完了した配信者IDを設定 (nullでリセット) */
  setSequenceCompletedPeerId: (peerId: string | null) => void;
  /** RTM完全コントロール更新を設定 */
  setRtmLovenseUpdate: (update: LovenseRtmUpdate | null) => void;
};

/**
 * localStorageからLovense状態を取得
 */
const getInitialLovenseState = (): LovenseStateData => {
  if (typeof window === 'undefined') {
    return defaultLovenseState;
  }

  try {
    const stored = localStorage.getItem('lovenseState');
    if (stored) {
      const parsed = JSON.parse(stored);
      const today = getTodayDateString();

      // 日付が変わっていればisPlayedTodayをリセット
      if (parsed.lastPlayedDate !== today && parsed.isPlayedToday) {
        return {
          ticketCount: parsed.ticketCount ?? 0,
          isPlayedToday: false,
          isCampaignActive: parsed.isCampaignActive ?? false,
          menuItems: parsed.menuItems ?? [],
          lastPlayedDate: null,
        };
      }

      return {
        ticketCount: parsed.ticketCount ?? 0,
        isPlayedToday: parsed.isPlayedToday ?? false,
        isCampaignActive: parsed.isCampaignActive ?? false,
        menuItems: parsed.menuItems ?? [],
        lastPlayedDate: parsed.lastPlayedDate ?? null,
      };
    }
  } catch (_error) {
    // エラー時はデフォルト値を返す
  }

  return defaultLovenseState;
};

/**
 * sessionStorageからシーケンス完了した配信者IDを取得
 */
const getInitialSequenceCompletedPeerId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem('lovenseSequenceCompletedPeerId');
};

/**
 * localStorage に Lovense 状態を保存
 */
const saveLovenseStateToStorage = (state: LovenseStateData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lovenseState', JSON.stringify(state));
  }
};

export const useLovenseStore = create<LovenseStoreState>()((set, get) => ({
  // Initial state
  lovenseState: getInitialLovenseState(),
  sequenceState: defaultSequenceState,
  autoSequenceTriggered: false,
  sequenceCompletedPeerId: getInitialSequenceCompletedPeerId(),
  rtmLovenseUpdate: null,

  // Actions - Lovense State
  setLovenseState: (state) => {
    set({ lovenseState: state });
    saveLovenseStateToStorage(state);
  },

  updateLovenseState: (updates) => {
    const currentState = get().lovenseState;
    const newState: LovenseStateData = {
      ticketCount: updates.ticketCount ?? currentState.ticketCount,
      isPlayedToday: updates.isPlayedToday ?? currentState.isPlayedToday,
      isCampaignActive:
        updates.isCampaignActive ?? currentState.isCampaignActive,
      menuItems: updates.menuItems ?? currentState.menuItems,
      lastPlayedDate:
        updates.lastPlayedDate !== undefined
          ? updates.lastPlayedDate
          : currentState.lastPlayedDate,
    };
    set({ lovenseState: newState });
    saveLovenseStateToStorage(newState);
  },

  setTicketCount: (count) => {
    const currentState = get().lovenseState;
    const newState: LovenseStateData = {
      ...currentState,
      ticketCount: count,
    };
    set({ lovenseState: newState });
    saveLovenseStateToStorage(newState);
  },

  setIsPlayedToday: (played) => {
    const currentState = get().lovenseState;
    const newState: LovenseStateData = {
      ticketCount: currentState.ticketCount,
      isPlayedToday: played,
      isCampaignActive: currentState.isCampaignActive,
      menuItems: currentState.menuItems,
      lastPlayedDate: played ? getTodayDateString() : null,
    };
    set({ lovenseState: newState });
    saveLovenseStateToStorage(newState);
  },

  setIsCampaignActive: (active) => {
    const currentState = get().lovenseState;
    const newState: LovenseStateData = {
      ...currentState,
      isCampaignActive: active,
    };
    set({ lovenseState: newState });
    saveLovenseStateToStorage(newState);
  },

  setMenuItems: (items) => {
    const currentState = get().lovenseState;
    const newState: LovenseStateData = {
      ...currentState,
      menuItems: items,
    };
    set({ lovenseState: newState });
    saveLovenseStateToStorage(newState);
  },

  checkDateChange: () => {
    const { lovenseState } = get();
    const today = getTodayDateString();

    if (lovenseState.lastPlayedDate !== today && lovenseState.isPlayedToday) {
      const newState: LovenseStateData = {
        ...lovenseState,
        isPlayedToday: false,
        lastPlayedDate: null,
      };
      set({ lovenseState: newState });
      saveLovenseStateToStorage(newState);
    }
  },

  // Actions - Sequence State
  setSequenceState: (state) => set({ sequenceState: state }),

  updateSequenceState: (updates) =>
    set((s) => ({
      sequenceState: { ...s.sequenceState, ...updates },
    })),

  resetSequence: () => set({ sequenceState: defaultSequenceState }),

  setAutoSequenceTriggered: (triggered) =>
    set({ autoSequenceTriggered: triggered }),

  setSequenceCompletedPeerId: (peerId) => {
    set({ sequenceCompletedPeerId: peerId });
    // sessionStorageに保存
    if (typeof window !== 'undefined') {
      if (peerId) {
        sessionStorage.setItem('lovenseSequenceCompletedPeerId', peerId);
      } else {
        sessionStorage.removeItem('lovenseSequenceCompletedPeerId');
      }
    }
  },
  setRtmLovenseUpdate: (update) => {
    set({ rtmLovenseUpdate: update });
    if (update?.expiresAt !== undefined) {
      const ttl = update.expiresAt - Date.now();
      if (ttl > 0) {
        setTimeout(() => {
          set((state) => {
            // 同じupdatedAtのメッセージのみクリア（新しいメッセージで上書き済みの場合は無視）
            if (state.rtmLovenseUpdate?.updatedAt === update.updatedAt) {
              return { rtmLovenseUpdate: null };
            }
            return {};
          });
        }, ttl);
      } else {
        // すでに期限切れの場合は即時クリア
        set({ rtmLovenseUpdate: null });
      }
    }
  },
}));
