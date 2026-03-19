/**
 * 購入フローの定数定義
 *
 * 【拡張方法】
 * 新しい課金フローを追加する場合、ここに定数を追加してください。
 * 例: GIFT_CHARGE: "gift_charge"
 */
export const PURCHASE_FLOW = {
  /** /purchaseページからの通常フロー */
  PURCHASE_PAGE: 'purchase_page',
  /** クイックチャージ（Alvionエンドポイント使用） */
  QUICK_CHARGE: 'quick_charge',
  /** Alvion外部決済（iframeまたはリダイレクト） */
  ALVION: 'alvion',
  /** 通話中チャージ */
  IN_CALL_CHARGE: 'in_call_charge',
  /** Renkaアプリ（Apple Pay） */
  RENKA: 'renka',
  /** その他 */
  OTHER: 'other',
} as const;

/**
 * 購入フローの種類
 */
export type PurchaseFlow = (typeof PURCHASE_FLOW)[keyof typeof PURCHASE_FLOW];

/**
 * Purchase Attribution: 購入起点情報
 *
 * @property source_path - クリック時のパス（例: "/user/123", "/message/456"）
 * @property source_ui - UI識別子（例: "modal.call_point_shortage.quick_charge"）
 * @property flow - 購入フローの種類
 * @property ts - 保存時刻（TTL管理用）
 * @property nonce - 衝突防止用ランダムID
 */
export type PurchaseAttribution = {
  source_path: string;
  source_ui: string;
  flow: PurchaseFlow;
  ts: number;
  nonce: string;
};

export type PurchaseAttributionInput = Omit<
  PurchaseAttribution,
  'ts' | 'nonce'
>;
