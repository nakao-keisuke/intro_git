import { useCallback, useRef } from 'react';
import { usePurchaseAttribution } from '@/hooks/usePurchaseAttribution';
import { PURCHASE_FLOW } from '@/types/purchaseAttribution';
import { clearPurchaseAttribution } from '@/utils/purchaseAttribution';

/**
 * 通話中課金の通話タイプ
 * - live: ライブ配信 / ビデオチャット（1対多）
 * - videocall: ビデオ通話（1対1）
 * - voicecall: 音声通話（1対1）
 */
export type InCallChargeType = 'live' | 'videocall' | 'voicecall';

/**
 * 通話中課金のトラッキング用フック
 *
 * @param canQuickCharge - クイックチャージ可能かどうか
 * @param chargeType - 通話タイプ（live, videocall, voicecall）
 * @returns trackInCallCharge - 通話中課金のトラッキングを開始
 * @returns clearInCallChargeAttribution - トラッキング情報をクリア（購入せずにモーダルを閉じた場合）
 *
 * @example
 * ```tsx
 * const { trackInCallCharge, clearInCallChargeAttribution } = useInCallPurchaseTracking(canQuickCharge, 'live');
 *
 * // モーダルを開く時
 * const handleOpenModal = () => {
 *   trackInCallCharge();
 *   setIsModalOpen(true);
 * };
 *
 * // モーダルを閉じる時（購入せずに閉じた場合）
 * const handleCloseModal = () => {
 *   clearInCallChargeAttribution();
 *   setIsModalOpen(false);
 * };
 * ```
 */
export function useInCallPurchaseTracking(
  canQuickCharge: boolean,
  chargeType: InCallChargeType,
) {
  const { trackPurchaseIntent } = usePurchaseAttribution();
  const hasTrackedRef = useRef(false);

  /**
   * 通話中課金のトラッキングを開始
   * 重複呼び出しを防ぐため、一度トラッキングしたら次回のクリアまでスキップ
   */
  const trackInCallCharge = useCallback(() => {
    if (hasTrackedRef.current) return;

    const flow = canQuickCharge
      ? PURCHASE_FLOW.QUICK_CHARGE
      : PURCHASE_FLOW.ALVION;
    // source_ui: modal.in_call_charge.{chargeType} (例: modal.in_call_charge.live)
    trackPurchaseIntent(`modal.in_call_charge.${chargeType}`, flow);
    hasTrackedRef.current = true;
  }, [canQuickCharge, chargeType, trackPurchaseIntent]);

  /**
   * トラッキング情報をクリア（購入せずにモーダルを閉じた場合に呼び出す）
   * 購入成功時は sendPurchaseEvent 内で自動的にクリアされるため、このメソッドは不要
   */
  const clearInCallChargeAttribution = useCallback(() => {
    clearPurchaseAttribution();
    hasTrackedRef.current = false;
  }, []);

  return {
    trackInCallCharge,
    clearInCallChargeAttribution,
  };
}
