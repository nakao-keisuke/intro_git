import { useRef, useState } from 'react';
import type {
  PostUserReviewRequest,
  PostUserReviewResponse,
} from '@/apis/http/review';
import { HTTP_POST_USER_REVIEW } from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ResponseData } from '@/types/NextApi';
import { trackEvent } from '@/utils/eventTracker';

type UsePostUserReviewReturn = {
  postReview: (
    targetUserId: string,
    score: number,
    description?: string,
    source?: 'profile' | 'call_end' | 'unknown',
  ) => Promise<PostReviewResult>;
  isLoading: boolean;
  error: string | null;
  response: ResponseData<PostUserReviewResponse> | null;
};

type PostReviewResult = {
  success: boolean;
  message?: string;
  data?: PostUserReviewResponse;
};

export const usePostUserReview = (): UsePostUserReviewReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] =
    useState<ResponseData<PostUserReviewResponse> | null>(null);
  const isSubmittingRef = useRef(false);

  const postReview = async (
    targetUserId: string,
    score: number,
    description?: string,
    source: 'profile' | 'call_end' | 'unknown' = 'unknown',
  ): Promise<PostReviewResult> => {
    // useRefを使用して同時実行を確実に防止
    if (isSubmittingRef.current) {
      return { success: false, message: '送信中です' };
    }
    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const requestBody: PostUserReviewRequest = {
        target_user_id: targetUserId,
        score,
        ...(description !== undefined && { description }),
        source,
      };

      const res = await client.post<ResponseData<PostUserReviewResponse>>(
        HTTP_POST_USER_REVIEW,
        requestBody,
      );

      setResponse(res);

      if (res.type === 'error') {
        setError(res.message || '投稿に失敗しました');
        return { success: false, message: res.message };
      }

      // 成功時のイベント送信（旧コードから移植）
      trackEvent(event.COMPLETE_SUBMIT_REVIEW, {
        target_user_id: targetUserId,
        source,
      });

      return {
        success: true,
        message: 'レビューを投稿しました',
        data: res as PostUserReviewResponse,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '投稿に失敗しました';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return { postReview, isLoading, error, response };
};
