import { useCallback, useEffect, useState } from 'react';
import type {
  GetUserReviewListRequest,
  GetUserReviewListResponse,
} from '@/apis/http/review';
import { HTTP_GET_USER_REVIEW_LIST } from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ReviewItem } from '@/services/profile/type';
import type { ResponseData } from '@/types/NextApi';

// 既存のインポートとの互換性のため再エクスポート
export type { ReviewItem } from '@/services/profile/type';

export const useGetReviewList = (
  token: string | undefined,
  targetUserId: string,
) => {
  const [reviewList, setReviewList] = useState<ReviewItem[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    // トークンとtargetUserIdの両方をバリデーション
    if (!token || !targetUserId) {
      setError('必要なパラメータが不足しています');
      return;
    }

    setLoading(true);
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

      if (res.type === 'error') {
        setError(res.message || 'レビュー一覧の取得に失敗しました');
        return;
      }

      const successRes = res as GetUserReviewListResponse & { type: 'success' };
      setReviewList(successRes.reviews ?? []);
      setAverageScore(successRes.averageScore ?? 0);
      setReviewCount(successRes.reviewCount ?? 0);
    } catch (_e) {
      setError('サーバーエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [token, targetUserId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviewList,
    averageScore,
    reviewCount,
    loading,
    error,
    fetchReviews,
  };
};

export default useGetReviewList;
