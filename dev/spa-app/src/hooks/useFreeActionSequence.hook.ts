/**
 * Lovense自動発動シーケンス機能のカスタムフック
 * 最初の視聴者として入室した際に、ランダムなパターンでLovenseを自動発動する
 */

import { useSession } from '#/hooks/useSession';
import { useCallback, useEffect, useRef } from 'react';
import type { LovenseMenuItem } from '@/apis/http/lovense';
import {
  getRandomPattern,
  INTENSITY_TO_TYPE_MAP,
  type LovenseAction,
  type LovensePattern,
} from '@/constants/lovenseSequences';
import {
  defaultSequenceState,
  type SequencePhase,
  useLovenseStore,
} from '@/features/lovense/store/lovenseStore';
import type { MessageWithType } from '@/types/MessageWithType';
import { sendPostMenu } from '@/utils/sendLovenseMenu';

interface UseFreeActionSequenceProps {
  /** Lovenseメニューアイテムリスト */
  lovenseMenuItems: LovenseMenuItem[];
  /** 配信者ID */
  receiverId: string;
  /** チャンネルID（配信ごとに一意、同じ配信者でも異なる配信なら異なるID） */
  channelId: string;
  /** 通話タイプ */
  callType: 'live' | 'side_watch';
  /** RTMメッセージ送信関数 */
  onSendMessageToChannel?:
    | ((message: Record<string, unknown>) => Promise<void>)
    | undefined;
  /** ライブメッセージ更新関数 */
  setLiveMessages?:
    | React.Dispatch<React.SetStateAction<MessageWithType[]>>
    | undefined;
  /** ポイント更新関数 */
  setCurrentPoint?: ((point: number) => void) | undefined;
}

interface UseFreeActionSequenceReturn {
  /** シーケンスが実行中かどうか */
  isRunning: boolean;
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
  /** 現在のアクションインデックス（1始まりで表示用） */
  currentActionNumber: number;
  /** 総アクション数 */
  totalActions: number;
  /** 選択されたパターン */
  pattern: LovensePattern | null;
  /** シーケンスを手動で開始する（デバッグ用） */
  startSequence: () => void;
  /** シーケンスをキャンセルする */
  cancelSequence: () => void;
}

/**
 * LovenseIntensityTypeからメニューアイテムを検索する
 * 1. まずtypeフィールドで英語名を検索（例: 'medium'）
 * 2. 見つからない場合はdisplayNameで日本語名を検索（例: '中'）
 * 3. さらに見つからない場合はtypeフィールドで日本語名を検索
 */
const findMenuItemByIntensity = (
  menuItems: LovenseMenuItem[],
  intensityType: string,
): LovenseMenuItem | undefined => {
  const menuType =
    INTENSITY_TO_TYPE_MAP[intensityType as keyof typeof INTENSITY_TO_TYPE_MAP];

  // 1. typeフィールドで英語名を検索
  if (menuType) {
    const byType = menuItems.find((item) => item.type === menuType);
    if (byType) {
      return byType;
    }
  }

  // 2. displayNameで日本語名を検索
  const byDisplayName = menuItems.find(
    (item) => item.displayName === intensityType,
  );
  if (byDisplayName) {
    return byDisplayName;
  }

  // 3. typeフィールドで日本語名を検索（一部のAPIが日本語でtypeを返す場合）
  const byJapaneseType = menuItems.find((item) => item.type === intensityType);
  if (byJapaneseType) {
    return byJapaneseType;
  }

  return undefined;
};

export const useFreeActionSequence = ({
  lovenseMenuItems,
  receiverId,
  channelId,
  callType,
  onSendMessageToChannel,
  setLiveMessages,
  setCurrentPoint,
}: UseFreeActionSequenceProps): UseFreeActionSequenceReturn => {
  const { data: session } = useSession();

  // Zustand状態
  const isTriggered = useLovenseStore((s) => s.autoSequenceTriggered);
  const setIsTriggered = useLovenseStore((s) => s.setAutoSequenceTriggered);
  const sequenceState = useLovenseStore((s) => s.sequenceState);
  const setSequenceState = useLovenseStore((s) => s.setSequenceState);
  const completedPeerId = useLovenseStore((s) => s.sequenceCompletedPeerId);
  const setCompletedPeerId = useLovenseStore(
    (s) => s.setSequenceCompletedPeerId,
  );

  // 現在のチャンネル（配信）で既に完了しているかどうか
  const isCompletedForCurrentChannel = completedPeerId === channelId;

  // タイマー参照
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isExecutingRef = useRef(false);
  // lovenseMenuItemsをrefで保持（setInterval内からアクセス用）
  const lovenseMenuItemsRef = useRef(lovenseMenuItems);
  lovenseMenuItemsRef.current = lovenseMenuItems;
  // channelIdをrefで保持（setInterval内からアクセス用）
  const channelIdRef = useRef(channelId);
  channelIdRef.current = channelId;

  /**
   * シーケンスをリセットする
   */
  const resetSequence = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    isExecutingRef.current = false;
    setSequenceState(defaultSequenceState);
  }, [setSequenceState]);

  /**
   * シーケンスをキャンセルする
   */
  const cancelSequence = useCallback(() => {
    resetSequence();
    setIsTriggered(false);
  }, [resetSequence, setIsTriggered]);

  /**
   * Lovenseアクションを実行する
   * @returns 成功時は実際のduration（秒）、失敗時はnull
   */
  const executeLovenseAction = useCallback(
    async (action: LovenseAction): Promise<number | null> => {
      const menuItem = findMenuItemByIntensity(
        lovenseMenuItems,
        action.intensity,
      );
      if (!menuItem) {
        return null;
      }

      // 発動時間を設定（メニューアイテムのdurationを使用）
      const result = await sendPostMenu({
        item: menuItem,
        receiverId,
        callType,
        session,
        onSendMessageToChannel,
        setLiveMessages,
        setCurrentPoint,
        isFreeAction: true,
      });

      // 成功時は実際のdurationを返す
      return result ? menuItem.duration : null;
    },
    [
      lovenseMenuItems,
      receiverId,
      callType,
      session,
      onSendMessageToChannel,
      setLiveMessages,
      setCurrentPoint,
    ],
  );

  /**
   * シーケンスを開始する
   */
  const startSequence = useCallback(() => {
    if (isExecutingRef.current || isCompletedForCurrentChannel) {
      return;
    }

    // Lovenseメニューが空の場合は開始しない
    if (lovenseMenuItems.length === 0) {
      return;
    }

    isExecutingRef.current = true;
    const pattern = getRandomPattern();

    if (!pattern.actions || pattern.actions.length === 0) {
      isExecutingRef.current = false;
      return;
    }

    const firstAction = pattern.actions[0];
    if (!firstAction) {
      isExecutingRef.current = false;
      return;
    }

    // 初期状態を設定
    setSequenceState({
      isRunning: true,
      pattern,
      currentActionIndex: 0,
      phase: 'countdown',
      countdown: firstAction.countdownSeconds,
      activationRemaining: firstAction.activationSeconds,
      waitingRemaining: firstAction.waitSeconds,
      currentAction: firstAction,
      activationEndTime: null,
    });

    // 1秒ごとにタイマーを更新
    timerRef.current = setInterval(() => {
      const prev = useLovenseStore.getState().sequenceState;

      if (!prev.isRunning || !prev.pattern || !prev.currentAction) {
        return;
      }

      const {
        phase,
        countdown,
        currentActionIndex,
        pattern,
        activationEndTime,
      } = prev;
      const now = Date.now();

      // カウントダウンフェーズ
      if (phase === 'countdown') {
        if (countdown > 1) {
          setSequenceState({ ...prev, countdown: countdown - 1 });
          return;
        } else if (countdown === 1) {
          // カウントダウンが0になる → Lovense発動してactivationフェーズへ即座に移行
          const currentAction = pattern.actions[currentActionIndex];
          if (currentAction) {
            // メニューアイテムから実際のdurationを取得
            const menuItem = findMenuItemByIntensity(
              lovenseMenuItemsRef.current,
              currentAction.intensity,
            );
            const actualDuration =
              menuItem?.duration ?? currentAction.activationSeconds;

            // Lovense発動（非同期、awaitしない）
            executeLovenseAction(currentAction);

            // 終了予定時刻を設定（実際のdurationを使用）
            const endTime = now + actualDuration * 1000;

            setSequenceState({
              ...prev,
              countdown: 0,
              phase: 'activation' as const,
              activationRemaining: actualDuration,
              activationEndTime: endTime,
            });
            return;
          }
          setSequenceState({
            ...prev,
            countdown: 0,
            phase: 'activation' as const,
          });
          return;
        } else {
          // countdown === 0 の場合（通常はここには来ない）
          setSequenceState({ ...prev, phase: 'activation' as const });
          return;
        }
      }

      // 発動フェーズ（終了時刻ベースで判定）
      if (phase === 'activation') {
        // 終了時刻を過ぎたか確認
        if (activationEndTime && now >= activationEndTime) {
          // activation終了 → 次のアクションへ即座に遷移
          const nextActionIndex = currentActionIndex + 1;

          if (nextActionIndex >= pattern.actions.length) {
            // 全アクション完了
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            isExecutingRef.current = false;
            setCompletedPeerId(channelIdRef.current);
            setSequenceState({
              ...defaultSequenceState,
              phase: 'completed',
              pattern,
            });
            return;
          }

          // 次のアクションを開始
          const nextAction = pattern.actions[nextActionIndex];
          if (!nextAction) {
            // 安全のため終了
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            isExecutingRef.current = false;
            setSequenceState(defaultSequenceState);
            return;
          }

          // 次のアクションのカウントダウンを即座に開始
          setSequenceState({
            ...prev,
            currentActionIndex: nextActionIndex,
            phase: 'countdown',
            countdown: nextAction.countdownSeconds,
            activationRemaining: nextAction.activationSeconds,
            waitingRemaining: 0,
            currentAction: nextAction,
            activationEndTime: null,
          });
          return;
        }

        // まだ終了時刻に達していない場合、残り時間を更新（表示用）
        if (activationEndTime) {
          const remainingMs = activationEndTime - now;
          const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
          setSequenceState({ ...prev, activationRemaining: remainingSec });
        }
      }
    }, 1000);
  }, [
    lovenseMenuItems,
    isCompletedForCurrentChannel,
    setSequenceState,
    setCompletedPeerId,
    executeLovenseAction,
  ]);

  /**
   * トリガーが発火したらシーケンスを開始
   */
  useEffect(() => {
    if (
      !isTriggered ||
      isExecutingRef.current ||
      isCompletedForCurrentChannel ||
      lovenseMenuItems.length === 0
    ) {
      return;
    }

    // 少し遅延を入れてから開始（入室処理が完了するのを待つ）
    const startTimer = setTimeout(() => {
      startSequence();
      setIsTriggered(false);
    }, 2000);

    return () => clearTimeout(startTimer);
  }, [
    isTriggered,
    isCompletedForCurrentChannel,
    lovenseMenuItems.length,
    startSequence,
    setIsTriggered,
  ]);

  /**
   * コンポーネントのアンマウント時にクリーンアップ
   */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    isRunning: sequenceState.isRunning,
    phase: sequenceState.phase,
    countdown: sequenceState.countdown,
    activationRemaining: sequenceState.activationRemaining,
    waitingRemaining: sequenceState.waitingRemaining,
    currentAction: sequenceState.currentAction,
    currentActionNumber: sequenceState.currentActionIndex + 1,
    totalActions: sequenceState.pattern?.actions.length ?? 0,
    pattern: sequenceState.pattern,
    startSequence,
    cancelSequence,
  };
};
