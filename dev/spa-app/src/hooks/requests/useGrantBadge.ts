import { useRef, useState } from 'react';
import type {
  GrantUserBadgeData,
  GrantUserBadgeRequest,
  GrantUserBadgeRouteResponse,
} from '@/apis/http/badge';
import { HTTP_GRANT_BADGE } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type UseGrantBadgeReturn = {
  grantBadge: (
    targetUserId: string,
    badgeIds: string[],
  ) => Promise<GrantBadgeResult>;
  isLoading: boolean;
  error: string | null;
  response: GrantUserBadgeRouteResponse | null;
};

type GrantBadgeResult = {
  success: boolean;
  message?: string;
  data?: GrantUserBadgeData;
};

export const useGrantBadge = (): UseGrantBadgeReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<GrantUserBadgeRouteResponse | null>(
    null,
  );
  const isSubmittingRef = useRef(false);

  const grantBadge = async (
    targetUserId: string,
    badgeIds: string[],
  ): Promise<GrantBadgeResult> => {
    // useRefを使用して同時実行を確実に防止
    if (isSubmittingRef.current) {
      return { success: false, message: '処理中です' };
    }
    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const requestBody: GrantUserBadgeRequest = {
        partner_id: targetUserId,
        badge_id: badgeIds,
      };

      const res = await client.post<GrantUserBadgeRouteResponse>(
        HTTP_GRANT_BADGE,
        requestBody,
      );

      setResponse(res);

      if (res.type === 'error') {
        setError(res.message || 'バッジ付与に失敗しました');
        return { success: false, message: res.message };
      }

      return {
        success: true,
        message: 'バッジを付与しました',
        ...(res.data && { data: res.data }),
      };
    } catch (err) {
      console.error('[useGrantBadge] 例外発生', err);
      const errorMessage =
        err instanceof Error ? err.message : 'バッジ付与に失敗しました';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return { grantBadge, isLoading, error, response };
};
