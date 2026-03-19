import { useState } from 'react';
import type {
  GetPresentMenuListResponse,
  PayPresentMenuPointResponse,
  PresentMenuItem,
} from '@/apis/http/present';
import {
  HTTP_GET_PRESENT_MENU_LIST,
  HTTP_PAY_PRESENT_MENU_POINT,
} from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ResponseData } from '@/types/NextApi';

// ──────────────────────────────────────────
// プレゼントメニュー一覧取得フック
// ──────────────────────────────────────────

type UseGetPresentMenuListReturn = {
  fetchPresentMenuList: (partnerId: string) => Promise<PresentMenuItem[]>;
  isLoading: boolean;
  error: string | null;
};

export const useGetPresentMenuList = (): UseGetPresentMenuListReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPresentMenuList = async (
    partnerId: string,
  ): Promise<PresentMenuItem[]> => {
    if (isLoading) return [];
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<
        ResponseData<GetPresentMenuListResponse>
      >(HTTP_GET_PRESENT_MENU_LIST, { partner_id: partnerId });

      if (response.type === 'error') {
        setError(response.message || 'エラーが発生しました');
        return [];
      }

      return response.menuList || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'エラーが発生しました';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchPresentMenuList, isLoading, error };
};

// ──────────────────────────────────────────
// プレゼント送付ポイント消費フック
// ──────────────────────────────────────────

type PayPresentMenuPointParams = {
  partnerId: string;
  text: string;
  consumePoint: number;
  type: string;
  callType: 'live' | 'side_watch' | 'video';
};

type PayPresentMenuPointResult = {
  success: boolean;
  myPoint?: number;
  partnerPoint?: number;
  notEnoughPoint?: boolean;
  message?: string;
};

type UsePayPresentMenuPointReturn = {
  payPresentMenuPoint: (
    params: PayPresentMenuPointParams,
  ) => Promise<PayPresentMenuPointResult>;
  isLoading: boolean;
  error: string | null;
};

export const usePayPresentMenuPoint = (): UsePayPresentMenuPointReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payPresentMenuPoint = async (
    params: PayPresentMenuPointParams,
  ): Promise<PayPresentMenuPointResult> => {
    if (isLoading) return { success: false };
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<
        ResponseData<PayPresentMenuPointResponse>
      >(HTTP_PAY_PRESENT_MENU_POINT, {
        partner_id: params.partnerId,
        text: params.text,
        consume_point: params.consumePoint,
        type: params.type,
        call_type: params.callType,
      });

      if (response.type === 'error') {
        setError(response.message || 'エラーが発生しました');
        // エラーレスポンスには追加のフラグが含まれる可能性がある
        const errorResponse =
          response as ResponseData<PayPresentMenuPointResponse> & {
            notEnoughPoint?: boolean;
          };
        return {
          success: false,
          ...(errorResponse.notEnoughPoint && {
            notEnoughPoint: errorResponse.notEnoughPoint,
          }),
          message: response.message,
        };
      }

      return {
        success: true,
        myPoint: response.myPoint,
        partnerPoint: response.partnerPoint,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'エラーが発生しました';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { payPresentMenuPoint, isLoading, error };
};
