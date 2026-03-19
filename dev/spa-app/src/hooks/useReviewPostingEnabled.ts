import { useCallback, useEffect, useState } from 'react';
import type {
  ReviewPostingEnabledData,
  ReviewPostingEnabledRouteResponse,
} from '@/apis/http/reviewPostingEnabled';
import { HTTP_REVIEW_POSTING_ENABLED } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type ReviewPostingRequirement = {
  detail: string;
  isMet: boolean;
};

const REQUIREMENT_DETAILS = {
  HAS_NOT_REVIEWED: '対象ユーザーにレビュー未投稿',
  CALL_DURATION_ENOUGH: '通話/ライブ配信視聴が30秒以上',
} as const;

const FETCH_ERROR_MESSAGE = 'レビュー投稿条件の取得に失敗しました';

type ReviewPostingEnabledResponse = {
  data: ReviewPostingEnabledData | null;
  isLoading: boolean;
  errorMessage: string | null;
  requirements: ReviewPostingRequirement[];
  canWriteReview: boolean;
  refetch: () => Promise<void>;
};

export const useReviewPostingEnabled = (
  partnerId: string,
  options?: { enabled?: boolean },
): ReviewPostingEnabledResponse => {
  const enabled = options?.enabled ?? true;
  const [data, setData] = useState<ReviewPostingEnabledData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!partnerId || !enabled) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const client = new ClientHttpClient();
      const requestBody = { partnerId };

      const response = await client.post<ReviewPostingEnabledRouteResponse>(
        HTTP_REVIEW_POSTING_ENABLED,
        requestBody,
      );

      if (response.type === 'error') {
        setErrorMessage(response.message);
        setData(null);
      } else {
        setData(response.data ?? null);
      }
    } catch (_error) {
      setErrorMessage(FETCH_ERROR_MESSAGE);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [partnerId, enabled]);

  useEffect(() => {
    if (enabled) {
      void fetchStatus();
    }
  }, [fetchStatus, enabled]);

  const requirements: ReviewPostingRequirement[] = [
    {
      detail: REQUIREMENT_DETAILS.HAS_NOT_REVIEWED,
      isMet: data?.hasNotReviewed ?? false,
    },
    {
      detail: REQUIREMENT_DETAILS.CALL_DURATION_ENOUGH,
      isMet: data?.isCallDurationEnough ?? false,
    },
  ];

  const canWriteReview =
    Boolean(data?.hasNotReviewed) && Boolean(data?.isCallDurationEnough);

  return {
    data,
    isLoading,
    errorMessage,
    requirements,
    canWriteReview,
    refetch: fetchStatus,
  };
};
