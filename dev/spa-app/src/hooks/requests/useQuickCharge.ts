import { useState } from 'react';
import type {
  QuickChargeRequest,
  QuickChargeResponse,
} from '@/apis/http/payment';
import { HTTP_QUICK_CHARGE } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ErrorData, ResponseData } from '@/types/NextApi';

export type UseQuickChargeResult = {
  success: boolean;
  response?: QuickChargeResponse;
};

type UseQuickChargeReturn = {
  isSuccess: boolean | undefined;
  errorData: ErrorData | undefined;
  response: QuickChargeResponse | undefined;
  isPurchasing: boolean;
  startPurchase: (
    point: number,
    money: number,
  ) => Promise<UseQuickChargeResult>;
  onEnd: () => void;
};

/**
 * クイックチャージカスタムフック（Alvion実装）
 * 登録済みカードで即時決済を実行し、ポイントを追加する
 */
export const useQuickCharge = (): UseQuickChargeReturn => {
  const [isSuccess, setIsSuccess] = useState<boolean | undefined>(undefined);
  const [errorData, setErrorData] = useState<ErrorData | undefined>(undefined);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [response, setResponse] = useState<QuickChargeResponse | undefined>(
    undefined,
  );

  const startPurchase = async (
    point: number,
    money: number,
  ): Promise<UseQuickChargeResult> => {
    setIsPurchasing(true);
    setIsSuccess(undefined);
    setErrorData(undefined);
    setResponse(undefined);

    try {
      const client = new ClientHttpClient();
      const requestBody: QuickChargeRequest = {
        money,
        point,
      };

      const res = await client.post<ResponseData<QuickChargeResponse>>(
        HTTP_QUICK_CHARGE,
        requestBody,
      );

      if (res.type === 'error') {
        setErrorData(res);
        setIsSuccess(false);
        return { success: false };
      }

      // 成功時: Alvionレスポンス全体を保持（camelCase）
      setResponse(res);
      setIsSuccess(true);
      return { success: true, response: res };
    } catch (err) {
      console.error('Quick charge error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'サーバーエラーが発生しました';
      setErrorData({
        type: 'error',
        message: errorMessage,
      });
      setIsSuccess(false);
      return { success: false };
    } finally {
      setIsPurchasing(false);
    }
  };

  const onEnd = () => {
    setIsSuccess(undefined);
    setErrorData(undefined);
    setResponse(undefined);
  };

  return {
    isSuccess,
    errorData,
    response,
    isPurchasing,
    startPurchase,
    onEnd,
  };
};
