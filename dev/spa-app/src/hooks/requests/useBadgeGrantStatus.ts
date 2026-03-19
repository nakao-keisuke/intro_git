import { useCallback, useEffect, useState } from 'react';
import type {
  CheckBadgeGrantStatusData,
  CheckBadgeGrantStatusRouteResponse,
} from '@/apis/http/badge';
import { HTTP_BADGE_GRANT_STATUS } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type BadgeGrantRequirement = {
  detail: string;
  isMet: boolean;
};

const REQUIREMENT_DETAILS = {
  NOT_GRANTED_YET: 'バッジが未付与',
  SUFFICIENT_CLASS: '十分なランク',
} as const;

const FETCH_ERROR_MESSAGE = 'バッジ付与条件の取得に失敗しました';

type UseBadgeGrantStatusReturn = {
  data: CheckBadgeGrantStatusData | null;
  isLoading: boolean;
  errorMessage: string | null;
  requirements: BadgeGrantRequirement[];
  canGrantBadge: boolean;
  refetch: () => Promise<void>;
};

export const useBadgeGrantStatus = (
  targetUserId: string,
  options?: { enabled?: boolean },
): UseBadgeGrantStatusReturn => {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<CheckBadgeGrantStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!targetUserId || !enabled) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const client = new ClientHttpClient();
      const requestBody = { partner_id: targetUserId };

      const response = await client.post<CheckBadgeGrantStatusRouteResponse>(
        HTTP_BADGE_GRANT_STATUS,
        requestBody,
      );

      if (response.type === 'error') {
        setErrorMessage(response.message);
        setData(null);
      } else {
        setData(response.data ?? null);
      }
    } catch (error) {
      console.error('[useBadgeGrantStatus] 例外発生', error);
      setErrorMessage(FETCH_ERROR_MESSAGE);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, enabled]);

  useEffect(() => {
    if (enabled) {
      void fetchStatus();
    }
  }, [fetchStatus, enabled]);

  const requirements: BadgeGrantRequirement[] = [
    {
      detail: REQUIREMENT_DETAILS.NOT_GRANTED_YET,
      isMet: data?.notGrantedYet ?? false,
    },
    {
      detail: REQUIREMENT_DETAILS.SUFFICIENT_CLASS,
      isMet: data?.hasSufficientClass ?? false,
    },
  ];

  const canGrantBadge =
    Boolean(data?.notGrantedYet) && Boolean(data?.hasSufficientClass);

  return {
    data,
    isLoading,
    errorMessage,
    requirements,
    canGrantBadge,
    refetch: fetchStatus,
  };
};
