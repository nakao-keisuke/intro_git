import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

type GetUserReviewListRequest = JamboRequest & {
  readonly api: 'get_user_review_list';
  readonly token: string;
  readonly target_user_id: string;
};

// レビュー個別のデータ型（snake_case: Jambo APIからの生データ）
export type ReviewElementData = {
  review_info: {
    review_id: string;
    score: number;
    reviewer_user_id: string;
    description: string;
    created_at: number;
  };
  reviewer_user_info: {
    user_name: string;
    ava_id: string;
    age: number;
    user_id: string;
    [key: string]: unknown;
  };
};

// Jambo APIからのレスポンスデータ型（snake_case）
export type GetUserReviewListResponseData = JamboResponseData & {
  reviews: ReviewElementData[];
  average_score: number;
  review_count: number;
};

export const getUserReviewListRequest = (
  token: string,
  targetUserId: string,
): GetUserReviewListRequest => {
  return {
    api: 'get_user_review_list',
    token: token,
    target_user_id: targetUserId,
  };
};
