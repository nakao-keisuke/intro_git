import { create } from 'zustand';

/**
 * 配送先住所の型定義
 */
export type ShippingAddress = {
  user_id: string;
  last_name: string;
  first_name: string;
  postal_code: string;
  prefecture: string;
  city: string;
  address_line1: string;
  address_line2?: string;
  phone_number: string;
  is_default?: boolean;
};

/**
 * フリーマーケット関連の状態管理ストア
 *
 * Phase 8: fleaMarketAtom.ts, atom.ts から移行
 * - shippingAddressAtom → shippingAddress
 * - promotedFleaMarketItemIdAtom → promotedItemId
 * - purchasedFleaMarketItemIdsAtom → purchasedItemIds
 */
type FleaMarketStoreState = {
  // State
  /** 配送先住所 */
  shippingAddress: ShippingAddress | null;
  /** ピックアップ商品ID（RTMで指定） */
  promotedItemId: string | null;
  /** 購入済みフリマ商品IDのセット */
  purchasedItemIds: Set<string>;

  // Actions
  /** 配送先住所を設定 */
  setShippingAddress: (address: ShippingAddress | null) => void;
  /** 配送先住所をクリア */
  clearShippingAddress: () => void;
  /** ピックアップ商品IDを設定 */
  setPromotedItemId: (itemId: string | null) => void;
  /** 購入済み商品IDを追加 */
  addPurchasedItemId: (itemId: string) => void;
  /** 購入済み商品IDをクリア */
  clearPurchasedItemIds: () => void;
  /** 商品が購入済みかどうかを確認 */
  isPurchased: (itemId: string) => boolean;
};

export const useFleaMarketStore = create<FleaMarketStoreState>()(
  (set, get) => ({
    // Initial state
    shippingAddress: null,
    promotedItemId: null,
    purchasedItemIds: new Set(),

    // Actions
    setShippingAddress: (address) => set({ shippingAddress: address }),

    clearShippingAddress: () => set({ shippingAddress: null }),

    setPromotedItemId: (itemId) => set({ promotedItemId: itemId }),

    addPurchasedItemId: (itemId) =>
      set((state) => {
        const newSet = new Set(state.purchasedItemIds);
        newSet.add(itemId);
        return { purchasedItemIds: newSet };
      }),

    clearPurchasedItemIds: () => set({ purchasedItemIds: new Set() }),

    isPurchased: (itemId) => get().purchasedItemIds.has(itemId),
  }),
);
