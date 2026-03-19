import { create } from 'zustand';

/**
 * ポイント管理Store
 *
 * 【使用パターン】
 * 1. API レスポンスからの更新: setCurrentPoint(apiResponse.myPoint)
 * 2. ポーリング同期: syncWithPolling(pollingData.point)
 * 3. SSR初期化: initializeFromSSR(ssrPoint)
 * 4. 楽観的UI更新: updatePointOptimistic(-100) // 消費時
 * 5. ロールバック: updatePointOptimistic(+100) // APIエラー時
 * 6. 表示のみ: const point = usePointStore((s) => s.currentPoint)
 *
 * 【重要な前提条件】
 * - updatePointOptimistic を使用する前に、必ずポイント不足チェックを実行してください
 * - 事前バリデーションにより、楽観的更新後も保有ポイントが負になることはありません
 * - APIエラー時は必ずロールバック処理を実装してください
 *
 * 【使用例】
 * ```typescript
 * const currentPoint = usePointStore((s) => s.currentPoint);
 * const updatePointOptimistic = usePointStore((s) => s.updatePointOptimistic);
 * const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);
 *
 * // メッセージ送信の例
 * const handleSendMessage = async () => {
 *   // 1. 事前チェック（必須）
 *   if (currentPoint < MESSAGE_COST) {
 *     showPointShortageModal();
 *     return;
 *   }
 *
 *   // 2. 楽観的更新
 *   updatePointOptimistic(-MESSAGE_COST);
 *
 *   // 3. API呼び出し
 *   try {
 *     const response = await sendMessageAPI();
 *     // 4. 正確な値で上書き
 *     setCurrentPoint(response.myPoint);
 *   } catch (error) {
 *     // 5. ロールバック
 *     updatePointOptimistic(+MESSAGE_COST);
 *     showErrorToast();
 *   }
 * };
 * ```
 */

type PointState = {
  /** 現在の所持ポイント */
  currentPoint: number;

  /** ポイント不足アラート状態（trueの場合、PointCardが点滅する） */
  isPointShortageAlert: boolean;

  // Actions

  /**
   * ポイント値を直接設定（API レスポンス時に使用）
   * @param point - 新しいポイント値
   *
   * 使用タイミング:
   * - 通話中のポイント消費API完了時
   * - メッセージ送信API完了時
   * - ギフト送信API完了時
   * - ポイント購入完了時
   */
  setCurrentPoint: (point: number) => void;

  /**
   * 楽観的UI更新（差分でポイントを増減）
   * @param delta - ポイント増減量（マイナス値で消費、プラス値で獲得）
   *
   * 使用タイミング:
   * - メッセージ送信直前: updatePointOptimistic(-10)
   * - ギフト送信直前: updatePointOptimistic(-100)
   * - APIエラー時のロールバック: updatePointOptimistic(+10)
   *
   * ⚠️ 重要:
   * - 使用前に必ずポイント不足チェックを実行してください
   * - APIエラー時は必ずロールバック処理を実装してください
   * - この関数は負の値になることを防ぎません（事前チェックが前提）
   */
  updatePointOptimistic: (delta: number) => void;

  /**
   * ポーリングデータとの同期
   * @param point - ポーリングから取得した最新ポイント
   *
   * 使用タイミング:
   * - UnifiedPollingProviderでポイント情報を受信時
   * - 通話中以外は、ポーリングが自動的に最新値を取得します
   */
  syncWithPolling: (point: number) => void;

  /**
   * SSR初期値との同期
   * @param point - SSRで取得したポイント値
   *
   * 使用タイミング:
   * - マイページ表示時（useMyPagePoint内）
   * - currentPointが0の場合のみ、SSRの値で初期化します
   */
  initializeFromSSR: (point: number) => void;

  /**
   * ポイント不足アラートを発火（3秒後に自動リセット）
   *
   * 使用タイミング:
   * - おねだり、Lovense、プレゼントメニューでポイント不足エラー発生時
   * - PointCardが黄色に点滅してユーザーに気付かせる
   */
  triggerPointShortageAlert: () => void;
};

/** ポイント不足アラートの持続時間（ミリ秒） */
const POINT_SHORTAGE_ALERT_DURATION = 3000;

export const usePointStore = create<PointState>()((set, get) => ({
  currentPoint: 0,
  isPointShortageAlert: false,

  setCurrentPoint: (point) => {
    set({ currentPoint: point });
  },

  updatePointOptimistic: (delta) => {
    set((state) => ({
      currentPoint: state.currentPoint + delta,
    }));
  },

  syncWithPolling: (point) => {
    // ポーリングデータが有効な値の場合のみ同期
    if (typeof point === 'number' && !Number.isNaN(point)) {
      set({ currentPoint: point });
    }
  },

  initializeFromSSR: (point) => {
    const current = get().currentPoint;
    // currentPointが0の場合のみSSR値で初期化
    if (current === 0 && point > 0) {
      set({ currentPoint: point });
    }
  },

  triggerPointShortageAlert: () => {
    set({ isPointShortageAlert: true });
    setTimeout(() => {
      set({ isPointShortageAlert: false });
    }, POINT_SHORTAGE_ALERT_DURATION);
  },
}));
