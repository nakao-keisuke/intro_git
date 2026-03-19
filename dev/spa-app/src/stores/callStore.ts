import { create } from 'zustand';
import type { CallState } from '@/utils/callState';
import { beforeCall } from '@/utils/callState';

/**
 * 通話状態管理ストア
 *
 * Phase 5で currentCallState atom から移行
 * Phase 10で callDurationSecState atom から移行
 * Phase 10で isRtmLoginDoneWhenOutGoingCallAtom から移行
 *
 * 通話状態の種類:
 * - beforeCall: 通話前（デフォルト）
 * - inCall: 通話中
 * - afterCall: 通話後
 *
 * 通話時間:
 * - undefined: 通話前または通話終了後
 * - number: 通話中の経過秒数（0から開始）
 *
 * RTMログイン状態:
 * - false: 未ログイン
 * - true: ログイン済み（発信時）
 */
type CallStore = {
  /** 現在の通話状態 */
  callState: CallState;

  /** 通話経過秒数（undefined = 通話前/終了後） */
  callDurationSec: number | undefined;

  /** Agora RTMのログイン完了状態（発信時） */
  isRtmLoginDoneWhenOutGoingCall: boolean;

  /** 通話状態を設定 */
  setCallState: (state: CallState) => void;

  /** 通話状態をリセット（beforeCallに戻す） */
  resetCallState: () => void;

  /** 通話経過秒数を設定 */
  setCallDurationSec: (sec: number | undefined) => void;

  /** 通話経過秒数をインクリメント（undefined時は何もしない） */
  incrementCallDurationSec: () => void;

  /** RTMログイン状態を設定 */
  setIsRtmLoginDoneWhenOutGoingCall: (isDone: boolean) => void;
};

export const useCallStore = create<CallStore>((set) => ({
  // Initial state
  callState: beforeCall,
  callDurationSec: undefined,
  isRtmLoginDoneWhenOutGoingCall: false,

  // Actions
  setCallState: (state) => set({ callState: state }),
  resetCallState: () => set({ callState: beforeCall }),
  setCallDurationSec: (sec) => set({ callDurationSec: sec }),
  incrementCallDurationSec: () =>
    set((state) => ({
      callDurationSec:
        state.callDurationSec === undefined
          ? undefined
          : state.callDurationSec + 1,
    })),
  setIsRtmLoginDoneWhenOutGoingCall: (isDone) =>
    set({ isRtmLoginDoneWhenOutGoingCall: isDone }),
}));
