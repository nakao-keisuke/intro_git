import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

// ──────────────────────────────────────────
// CHECK_BADGE_GRANT_STATUS: バッジ付与可否チェック
// ──────────────────────────────────────────

/** クライアントからのリクエスト */
export type CheckBadgeGrantStatusRequest = {
  partner_id: string;
};

/** Route Handler からクライアントへのレスポンスデータ */
export type CheckBadgeGrantStatusData = {
  notGrantedYet: boolean;
  hasSufficientClass: boolean;
};

export type CheckBadgeGrantStatusRouteResponse =
  ApiRouteResponse<CheckBadgeGrantStatusData>;

/** Jambo API へのリクエスト */
export type CheckBadgeGrantStatusJamboRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.CHECK_BADGE_GRANT_STATUS;
  readonly token: string;
  readonly user_id: string;
  readonly target_user_id: string;
};

/** Jambo API からのレスポンス（serverHttpClient により CamelCase に変換済み） */
export type CheckBadgeGrantStatusUpstreamResponse = {
  notGrantedYet: boolean;
  hasSufficientClass: boolean;
};

export const createCheckBadgeGrantStatusRequest = (
  token: string,
  userId: string,
  targetUserId: string,
): CheckBadgeGrantStatusJamboRequest => ({
  api: JAMBO_API_ROUTE.CHECK_BADGE_GRANT_STATUS,
  token,
  user_id: userId,
  target_user_id: targetUserId,
});

// ──────────────────────────────────────────
// GRANT_USER_BADGE: バッジ付与
// ──────────────────────────────────────────

/** クライアントからのリクエスト */
export type GrantUserBadgeRequest = {
  partner_id: string;
  badge_id: string[];
};

/** Route Handler からクライアントへのレスポンスデータ */
export type GrantUserBadgeData = {
  message?: string | undefined;
};

export type GrantUserBadgeRouteResponse = ApiRouteResponse<GrantUserBadgeData>;

/** Jambo API へのリクエスト */
export type GrantUserBadgeJamboRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GRANT_USER_BADGE;
  readonly token: string;
  readonly user_id: string;
  readonly target_user_id: string;
  readonly badge_id: string[];
  readonly ip: string;
};

/** Jambo API からのレスポンス */
export type GrantUserBadgeUpstreamResponse = {
  message?: string;
};

export const createGrantUserBadgeRequest = (
  token: string,
  userId: string,
  targetUserId: string,
  badgeIds: string[],
  ip: string,
): GrantUserBadgeJamboRequest => ({
  api: JAMBO_API_ROUTE.GRANT_USER_BADGE,
  token,
  user_id: userId,
  target_user_id: targetUserId,
  badge_id: badgeIds,
  ip,
});

// ──────────────────────────────────────────
// GET_BADGE_PROGRESS: バッジ進捗取得
// ──────────────────────────────────────────

/** クライアントからのリクエスト */
export type GetBadgeProgressRequest = {
  partner_id: string;
};

/** バッジ情報 */
export type BadgeItem = {
  badgeId: string;
  badgeName: string;
  badgeType: 'auto' | 'manual';
  grantedTime: number | null;
  count: number;
  isAcquired: boolean;
};

/** Route Handler からクライアントへのレスポンスデータ */
export type GetBadgeProgressData = {
  badges: BadgeItem[];
  totalCount: number;
  achievedCount: number;
  totalCall: number;
};

export type GetBadgeProgressRouteResponse =
  ApiRouteResponse<GetBadgeProgressData>;

/** Jambo API へのリクエスト */
export type GetBadgeProgressJamboRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_BADGE_PROGRESS;
  readonly token: string;
  readonly target_user_id: string;
};

/** Jambo API からのレスポンス（serverHttpClient により CamelCase に変換済み） */
export type GetBadgeProgressUpstreamResponse = {
  badges: Array<{
    badgeId: string;
    badgeName: string;
    badgeType: 'auto' | 'manual';
    grantedTime: number | null;
    count: number;
  }>;
  totalCount: number;
  achievedCount: number;
  totalCall: number;
};

export const createGetBadgeProgressRequest = (
  token: string,
  targetUserId: string,
): GetBadgeProgressJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_BADGE_PROGRESS,
  token,
  target_user_id: targetUserId,
});

/** Jambo レスポンスをクライアント向けに変換 */
export const transformBadgeProgressResponse = (
  data: GetBadgeProgressUpstreamResponse,
): GetBadgeProgressData => ({
  badges: data.badges.map((badge) => ({
    badgeId: badge.badgeId,
    badgeName: badge.badgeName,
    badgeType: badge.badgeType || 'auto',
    grantedTime: badge.grantedTime,
    count: badge.count,
    isAcquired: badge.grantedTime !== null,
  })),
  totalCount: data.totalCount,
  achievedCount: data.achievedCount,
  totalCall: data.totalCall,
});
