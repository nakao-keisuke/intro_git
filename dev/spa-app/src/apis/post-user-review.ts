import type { JamboRequest } from '@/types/JamboApi';

export type PostUserReviewRequest = JamboRequest & {
  api: 'post_user_review';
  token: string;
  user_id: string;
  target_user_id: string;
  score: number;
  description?: string;
};

export type ReviewData = {
  review_id: string;
  score: number;
  description: string;
  created_at: number;
  reviewer_user_id: string;
  reviewer_user_name: string;
  reviewer_user_avatar: string;
};

export type PostUserReviewResponseData = {
  type: 'success' | 'error';
  message: string;
  code: number;
  data: ReviewData | null;
};

export const postUserReviewRequest = (
  token: string,
  user_id: string,
  target_user_id: string,
  score: number,
  description: string,
): PostUserReviewRequest => ({
  api: 'post_user_review',
  token,
  user_id,
  target_user_id,
  score,
  description,
});
