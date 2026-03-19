import { useState } from 'react';
import type { AddBlockRequest, AddBlockResponse } from '@/apis/http/block';
import { HTTP_ADD_BLOCK } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ResponseData } from '@/types/NextApi';
import { trackEvent } from '@/utils/eventTracker';

type UseBlockReturn = {
  addBlock: (partnerId: string) => Promise<boolean>;
  isLoading: boolean;
};

/**
 * ブロック機能のカスタムフック
 */
export const useBlock = (): UseBlockReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const client = new ClientHttpClient();

  const addBlock = async (partnerId: string): Promise<boolean> => {
    if (isLoading) return false;

    setIsLoading(true);
    try {
      const requestBody: AddBlockRequest = {
        partner_id: partnerId,
      };

      const response = await client.post<ResponseData<AddBlockResponse>>(
        HTTP_ADD_BLOCK,
        requestBody,
      );

      if (response.type === 'error') {
        alert(response.message || 'ブロックに失敗しました');
        return false;
      }

      trackEvent('TAP_ADD_BLOCK');
      return true;
    } catch (error) {
      console.error('Block addition failed', error);
      alert('ブロック処理中にエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { addBlock, isLoading };
};
