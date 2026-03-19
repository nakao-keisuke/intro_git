import { useCallback, useEffect, useState } from 'react';
import type {
  GetUserReviewListRequest,
  GetUserReviewListResponse,
  ReviewItem,
} from '@/apis/http/review';
import { HTTP_GET_USER_REVIEW_LIST } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ResponseData } from '@/types/NextApi';

type UseGetUserReviewListReturn = {
  reviewList: ReviewItem[];
  averageScore: number;
  reviewCount: number;
  isLoading: boolean;
  error: string | null;
  response: ResponseData<GetUserReviewListResponse> | null;
  fetchReviews: () => Promise<void>;
};

export const useGetUserReviewList = (
  token: string | undefined,
  targetUserId: string,
): UseGetUserReviewListReturn => {
  const [reviewList, setReviewList] = useState<ReviewItem[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] =
    useState<ResponseData<GetUserReviewListResponse> | null>(null);

  const fetchReviews = useCallback(async () => {
    // トークンとtargetUserIdの両方をバリデーション
    if (!token || !targetUserId) {
      // パラメータ不足は正常系（初期状態）として扱い、エラー設定しない
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const requestBody: GetUserReviewListRequest = {
        target_user_id: targetUserId,
      };

      const res = await client.post<ResponseData<GetUserReviewListResponse>>(
        HTTP_GET_USER_REVIEW_LIST,
        requestBody,
      );

      setResponse(res);

      if (res.type === 'error') {
        setError(res.message || 'レビュー一覧の取得に失敗しました');
        return;
      }

      // 成功時のデータ設定
      const successRes = res as GetUserReviewListResponse & { type: 'success' };
      setReviewList(successRes.reviews ?? []);
      setAverageScore(successRes.averageScore ?? 0);
      setReviewCount(successRes.reviewCount ?? 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'サーバーエラーが発生しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, targetUserId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviewList,
    averageScore,
    reviewCount,
    isLoading,
    error,
    response,
    fetchReviews,
  };
};

export default useGetUserReviewList;
