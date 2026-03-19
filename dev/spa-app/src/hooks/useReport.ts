import { useState } from 'react';
import type { AddReportRequest, AddReportResponse } from '@/apis/http/report';
import { HTTP_ADD_REPORT } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ResponseData } from '@/types/NextApi';
import { trackEvent } from '@/utils/eventTracker';

type UseReportReturn = {
  addReport: (partnerId: string) => Promise<boolean>;
  isLoading: boolean;
};

/**
 * 通報機能のカスタムフック
 */
export const useReport = (): UseReportReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const client = new ClientHttpClient();

  const addReport = async (partnerId: string): Promise<boolean> => {
    if (isLoading) return false;

    setIsLoading(true);
    try {
      const requestBody: AddReportRequest = {
        partner_id: partnerId,
      };

      const response = await client.post<ResponseData<AddReportResponse>>(
        HTTP_ADD_REPORT,
        requestBody,
      );

      if (response.type === 'error') {
        alert(response.message || '通報に失敗しました');
        return false;
      }

      trackEvent('COMPLETE_ADD_REPORT');
      return true;
    } catch (error) {
      console.error('Report addition failed', error);
      alert('通報処理中にエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { addReport, isLoading };
};
