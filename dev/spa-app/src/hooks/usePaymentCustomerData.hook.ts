import { useSession } from '#/hooks/useSession';
import { useEffect } from 'react';
import type { PaymentCustomerRouteResponse } from '@/apis/http/paymentCustomer';
import { HTTP_PAYMENT_CUSTOMER } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { usePaymentStore } from '@/stores/paymentStore';

/**
 * 支払い顧客データとクイックチャージ可否を管理する共通フック
 * セッション中に1回だけAPIを呼び出し、Zustandで状態を管理
 * Zustandのstoreで重複リクエストを防止（複数コンポーネント間で共有）
 */
export const usePaymentCustomerData = () => {
  const { data: session } = useSession();
  const paymentCustomerData = usePaymentStore((s) => s.customerData);
  const setPaymentCustomerData = usePaymentStore((s) => s.setCustomerData);
  const canQuickCharge = usePaymentStore((s) => s.canQuickCharge);
  const setCanQuickCharge = usePaymentStore((s) => s.setCanQuickCharge);
  const isLoadingRemote = usePaymentStore((s) => s.isLoading);
  const setIsLoadingRemote = usePaymentStore((s) => s.setIsLoading);

  useEffect(() => {
    const fetchPaymentCustomerData = async () => {
      // セッショントークンがない、または既にデータが取得済みの場合はスキップ
      if (paymentCustomerData !== null || !session?.user.token) {
        return;
      }

      // すでに同一処理が進行中なら待機（重複リクエスト防止）
      if (isLoadingRemote) {
        return;
      }

      setIsLoadingRemote(true);

      try {
        const client = new ClientHttpClient();
        const response = await client.post<PaymentCustomerRouteResponse>(
          HTTP_PAYMENT_CUSTOMER,
          {},
        );

        if (response.type === 'success' && response.data) {
          const hasPaymentMethod = !!response.data.defaultPaymentMethodId;
          const hasCustomer = !!response.data.stripeCustomerId;
          const canUseQuickCharge = hasPaymentMethod && hasCustomer;

          // Recoilで状態を管理
          setPaymentCustomerData({
            default_payment_method_id: response.data.defaultPaymentMethodId,
            stripe_customer_id: response.data.stripeCustomerId,
          });
          setCanQuickCharge(canUseQuickCharge);
        } else {
          // クレカ未登録の場合もローディング状態を解除するため、空データをセット
          setPaymentCustomerData({
            default_payment_method_id: '',
            stripe_customer_id: '',
          });
          setCanQuickCharge(false);
        }
      } catch (error) {
        console.error('Payment customer data error:', error);
        // エラー時もローディング状態を解除するため、空データをセット
        setPaymentCustomerData({
          default_payment_method_id: '',
          stripe_customer_id: '',
        });
        setCanQuickCharge(false);
      } finally {
        setIsLoadingRemote(false);
      }
    };

    // pageload中のfetchを回避するため、idle時まで遅延
    // 決済データはユーザー操作（課金ボタン押下等）時にのみ必要で、初期表示には不要
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => {
        void fetchPaymentCustomerData();
      });
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(() => {
      void fetchPaymentCustomerData();
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    session?.user.token,
    paymentCustomerData,
    isLoadingRemote,
    setPaymentCustomerData,
    setCanQuickCharge,
    setIsLoadingRemote,
  ]);

  return {
    paymentCustomerData,
    canQuickCharge,
    isLoading: !!(session?.user.token && paymentCustomerData === null),
  };
};
