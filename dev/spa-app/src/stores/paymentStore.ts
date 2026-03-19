import { create } from 'zustand';

/**
 * Stripe決済の顧客データ型
 * - default_payment_method_id: 登録済みのデフォルト決済方法ID
 * - stripe_customer_id: Stripe顧客ID
 */
type PaymentCustomerData = {
  default_payment_method_id: string;
  stripe_customer_id: string;
} | null;

/**
 * 決済関連の状態管理ストア
 *
 * Phase 4で以下のRecoil atomから移行:
 * - paymentCustomerDataAtom: Stripe顧客データ
 * - canQuickChargeAtom: クイックチャージ可否フラグ
 * - isLoadingPaymentCustomerAtom: 決済データ読み込み状態
 */
type PaymentStore = {
  // State
  /** Stripe顧客データ（登録済みカード情報） */
  customerData: PaymentCustomerData;

  /** クイックチャージ可否（customerDataが存在し、カード登録済みの場合true） */
  canQuickCharge: boolean;

  /** 決済データ読み込み中フラグ */
  isLoading: boolean;

  // Actions
  /** 顧客データを設定（API取得後に使用） */
  setCustomerData: (data: PaymentCustomerData) => void;

  /** クイックチャージ可否を設定 */
  setCanQuickCharge: (canCharge: boolean) => void;

  /** 読み込み状態を設定 */
  setIsLoading: (loading: boolean) => void;

  /** すべての決済状態をリセット（ログアウト時など） */
  resetPayment: () => void;
};

export const usePaymentStore = create<PaymentStore>((set) => ({
  // Initial state
  customerData: null,
  canQuickCharge: false,
  isLoading: false,

  // Actions
  setCustomerData: (data) => set({ customerData: data }),
  setCanQuickCharge: (canCharge) => set({ canQuickCharge: canCharge }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  resetPayment: () =>
    set({
      customerData: null,
      canQuickCharge: false,
      isLoading: false,
    }),
}));
