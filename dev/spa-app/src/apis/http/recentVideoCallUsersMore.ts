import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { RecentVideoCallUser } from '@/services/home/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

/**
 * クライアント → Route Handler のリクエスト型
 */
export type RecentVideoCallUsersMoreClientRequest = {
  readonly applicationId: string;
};

/**
 * Route Handler → クライアント のレスポンス型
 */
export type RecentVideoCallUsersMoreRouteResponse = ApiRouteResponse<
  RecentVideoCallUser[]
>;

/**
 * Route Handler → jambo-server のリクエスト型
 */
export type RecentVideoCallUsersMoreUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.RECENT_VIDEO_CALL_USERS;
  readonly application_id: string;
  readonly limit: number;
};

/**
 * jambo-server → Route Handler のレスポンス型
 */
export type RecentVideoCallUsersMoreUpstreamResponse = APIResponse<
  RecentVideoCallUser[]
>;

/**
 * クライアント → Route Handler のリクエスト作成関数
 */
export const createRecentVideoCallUsersMoreClientRequest = (
  applicationId: string,
): RecentVideoCallUsersMoreClientRequest => {
  return {
    applicationId,
  };
};

/**
 * Route Handler → jambo-serverへのリクエスト作成関数
 */
export const createRecentVideoCallUsersMoreUpstreamRequest = (
  applicationId: string,
): RecentVideoCallUsersMoreUpstreamRequest => {
  return {
    api: JAMBO_API_ROUTE.RECENT_VIDEO_CALL_USERS,
    application_id: applicationId,
    limit: 20,
  };
};
