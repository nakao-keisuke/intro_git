import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';

// ──────────────────────────────────────────
// POST USER REVIEW: 型定義 Client ⇔ Route Handler
// ──────────────────────────────────────────

/** クライアントからのレビュー投稿リクエスト */
export type PostUserReviewRequest = {
  target_user_id: string;
  score: number;
  description?: string | undefined;
  source?: 'profile' | 'call_end' | 'unknown';
};

/** Route Handler からクライアントへのレビュー投稿レスポンス */
export type PostUserReviewResponse = {
  message: string;
  reviewId: string;
  createdAt: number;
  score: number;
  description: string;
  reviewerUserId: string;
  reviewerUserName: string;
  reviewerUserAvatar: string;
};

// ──────────────────────────────────────────
// POST USER REVIEW: 型定義 Route Handler ⇔ Jambo
// ──────────────────────────────────────────

/** Jambo API へのレビュー投稿リクエスト */
export type PostUserReviewJamboRequest = {
  api: typeof JAMBO_API_ROUTE.POST_USER_REVIEW;
  token: string;
  user_id: string;
  target_user_id: string;
  score: number;
  description?: string;
};

/** Jambo API からのレビュー投稿レスポンス */
export type PostUserReviewJamboResponse = {
  code: number;
  data?: {
    review_id: string;
    created_at: number;
  };
  message?: string;
};

// ──────────────────────────────────────────
// POST USER REVIEW: リクエスト作成関数
// ──────────────────────────────────────────

export const createPostUserReviewJamboRequest = (
  token: string,
  userId: string,
  targetUserId: string,
  score: number,
  description?: string,
): PostUserReviewJamboRequest => ({
  api: JAMBO_API_ROUTE.POST_USER_REVIEW,
  token,
  user_id: userId,
  target_user_id: targetUserId,
  score,
  description: description ?? '',
});

// ──────────────────────────────────────────
// GET USER REVIEW LIST: 型定義 Client ⇔ Route Handler
// ──────────────────────────────────────────

/** クライアントからのレビュー一覧取得リクエスト */
export type GetUserReviewListRequest = {
  target_user_id: string;
};

/** レビュー情報（camelCase変換後） */
export type ReviewInfo = {
  reviewId: string;
  score: number;
  reviewerUserId: string;
  description: string;
  createdAt: number;
};

/** レビュアー情報（camelCase変換後） */
export type ReviewerUserInfo = {
  userName: string;
  avaId: string;
  age: number;
  userId: string;
};

/** レビューアイテム（camelCase変換後） */
export type ReviewItem = {
  reviewInfo: ReviewInfo;
  reviewerUserInfo: ReviewerUserInfo;
};

/** Route Handler からクライアントへのレビュー一覧レスポンス */
export type GetUserReviewListResponse = {
  reviews: ReviewItem[];
  averageScore: number;
  reviewCount: number;
};

// ──────────────────────────────────────────
// GET USER REVIEW LIST: 型定義 Route Handler ⇔ Jambo
// ──────────────────────────────────────────

/** Jambo API へのレビュー一覧取得リクエスト */
export type GetUserReviewListJamboRequest = {
  api: typeof JAMBO_API_ROUTE.GET_USER_REVIEW_LIST;
  token: string;
  target_user_id: string;
};

/** Jambo API からのレビュー要素（snake_case） */
export type JamboReviewElement = {
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
  };
};

/** Jambo API からのレビュー一覧レスポンス */
export type GetUserReviewListJamboResponse = {
  code: number;
  data?: {
    reviews: JamboReviewElement[];
    average_score: number;
    review_count: number;
  };
  message?: string;
};

// ──────────────────────────────────────────
// GET USER REVIEW LIST: リクエスト作成関数
// ──────────────────────────────────────────

export const createGetUserReviewListJamboRequest = (
  token: string,
  targetUserId: string,
): GetUserReviewListJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_USER_REVIEW_LIST,
  token,
  target_user_id: targetUserId,
});

// ──────────────────────────────────────────
// 変換関数
// ──────────────────────────────────────────

/** Jambo レビュー要素を camelCase に変換 */
export const transformJamboReviewToReviewItem = (
  jamboReview: JamboReviewElement,
): ReviewItem => ({
  reviewInfo: {
    reviewId: jamboReview.review_info.review_id,
    score: jamboReview.review_info.score,
    reviewerUserId: jamboReview.review_info.reviewer_user_id,
    description: jamboReview.review_info.description,
    createdAt: jamboReview.review_info.created_at,
  },
  reviewerUserInfo: {
    userName: jamboReview.reviewer_user_info.user_name,
    avaId: jamboReview.reviewer_user_info.ava_id,
    age: jamboReview.reviewer_user_info.age,
    userId: jamboReview.reviewer_user_info.user_id,
  },
});
