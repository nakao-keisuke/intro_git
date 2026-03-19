import { useLocation } from '@tanstack/react-router';
import { useCallback } from 'react';
import type { PurchaseFlow } from '@/types/purchaseAttribution';
import { setPurchaseAttribution } from '@/utils/purchaseAttribution';

/**
 * 課金導線をクリックした際に呼び出すフック
 *
 * @example
 * ```tsx
 * import { PURCHASE_FLOW } from "@/types/purchaseAttribution";
 *
 * const { trackPurchaseIntent } = usePurchaseAttribution();
 *
 * // モーダルの「クイックチャージ」ボタン
 * <button onClick={() => {
 *   trackPurchaseIntent("modal.call_point_shortage", PURCHASE_FLOW.QUICK_CHARGE);
 *   // クイックチャージ処理...
 * }}>
 *   クイックチャージ
 * </button>
 *
 * // モーダルの「Alvion決済」ボタン
 * <button onClick={() => {
 *   trackPurchaseIntent("modal.call_point_shortage", PURCHASE_FLOW.ALVION);
 *   // Alvion決済処理...
 * }}>
 *   外部決済
 * </button>
 * ```
 */
export function usePurchaseAttribution() {
  const pathname = usePathname();

  /**
   * 購入意図をトラッキング
   * @param sourceUiBase - UI識別子のベース部分（例: "modal.call_point_shortage"）
   * @param flow - 購入フロー（例: "quick_charge", "alvion"）
   */
  const trackPurchaseIntent = useCallback(
    (sourceUiBase: string, flow: PurchaseFlow) => {
      // source_uiは「ベース.flow」の形式で動的に生成
      const source_ui = `${sourceUiBase}.${flow}`;

      setPurchaseAttribution({
        source_path: pathname || 'undefined_path',
        source_ui,
        flow,
      });
    },
    [pathname],
  );

  return { trackPurchaseIntent };
}
