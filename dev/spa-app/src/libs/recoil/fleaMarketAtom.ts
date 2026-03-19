// フリーマーケット関連のカスタムフック
// NOTE: useShippingAddressフックはZustand (useFleaMarketStore) に移行済み

import { useSession } from 'next-auth/react';
import { useCallback, useEffect } from 'react';
import {
  GET_ADDRESS_FLEA_MARKET,
  REGISTER_ADDRESS_FLEA_MARKET,
} from '@/constants/endpoints';
import {
  type ShippingAddress,
  useFleaMarketStore,
} from '@/features/fleamarket/store/fleaMarketStore';
import { postToNext } from '@/utils/next';

// Re-export ShippingAddress type for backward compatibility
export type { ShippingAddress };

// APIレスポンスの型定義
type GetAddressFleaMarketApiResponse = {
  type: 'success' | 'error';
  code: number;
  message: string;
  data?: ShippingAddress[];
};

type RegisterAddressFleaMarketApiResponse = {
  type: 'success' | 'error';
  code: number;
  message: string;
  data?: any;
};

// 住所情報を永続化するカスタムフック
// NOTE: Zustand (useFleaMarketStore) に移行済み
export const useShippingAddress = () => {
  const shippingAddress = useFleaMarketStore((s) => s.shippingAddress);
  const setShippingAddress = useFleaMarketStore((s) => s.setShippingAddress);
  const { data: session } = useSession();

  // デフォルト住所を取得
  const fetchDefaultAddress = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await postToNext<GetAddressFleaMarketApiResponse>(
        GET_ADDRESS_FLEA_MARKET,
        {
          user_id: session.user.id,
        },
      );

      if (
        response.type !== 'error' &&
        response.code === 0 &&
        response.data &&
        response.data.length > 0
      ) {
        // is_defaultがtrueの住所を探す
        const defaultAddress = response.data.find(
          (addr: ShippingAddress) => addr.is_default,
        );

        if (defaultAddress) {
          setShippingAddress(defaultAddress);
        }
      }
    } catch (error) {
      if (import.meta.env.NODE_ENV === 'development') {
        console.error('Failed to fetch default address:', error);
      }
    }
  }, [session?.user?.id, setShippingAddress]);

  // 住所を登録・更新
  const saveAddress = useCallback(
    async (addressData: Omit<ShippingAddress, 'user_id'>) => {
      if (!session?.user?.id) {
        throw new Error('ユーザーがログインしていません');
      }

      try {
        const response = await postToNext<RegisterAddressFleaMarketApiResponse>(
          REGISTER_ADDRESS_FLEA_MARKET,
          {
            ...addressData,
            user_id: session.user.id,
          },
        );

        if (response.type !== 'error' && response.code === 0) {
          const addressToSave = {
            ...addressData,
            user_id: session.user.id,
          };
          setShippingAddress(addressToSave);
          return { success: true };
        } else {
          const errorMessage =
            response.type === 'error'
              ? response.message
              : '住所の登録に失敗しました';
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        if (import.meta.env.NODE_ENV === 'development') {
          console.error('Address registration error:', error);
        }
        return { success: false, error: '住所の登録中にエラーが発生しました' };
      }
    },
    [session?.user?.id, setShippingAddress],
  );

  // 住所をクリア
  const clearAddress = useCallback(() => {
    setShippingAddress(null);
  }, [setShippingAddress]);

  // コンポーネントマウント時にデフォルト住所を取得
  useEffect(() => {
    if (session?.user?.id && !shippingAddress) {
      fetchDefaultAddress();
    }
  }, [session?.user?.id, shippingAddress, fetchDefaultAddress]);

  return {
    shippingAddress,
    setShippingAddress,
    fetchDefaultAddress,
    saveAddress,
    clearAddress,
  };
};
