import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { MeetPeople } from '@/services/shared/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

/**
 * Client → Route Handler リクエスト（CamelCase）
 */
export type MeetPeopleMoreClientRequest = {
  readonly lastLoginTime: string | null;
};

/**
 * Client ← Route Handler レスポンス
 */
export type MeetPeopleMoreRouteResponse = ApiRouteResponse<MeetPeople[]>;

/**
 * Route Handler → jambo-server リクエスト（snake_case）
 */
export type MeetPeopleMoreUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.MEET_PEOPLE;
  readonly limit: number;
  readonly sort_type: number;
  readonly default_avatar_flag: boolean;
  readonly last_login_time?: string;
};

/**
 * jambo-server → Route Handler レスポンス
 */
export type MeetPeopleMoreUpstreamResponse = APIResponse<MeetPeople[]>;

/**
 * Client→Route Handlerリクエスト作成関数
 */
export const createMeetPeopleMoreClientRequest = (
  lastLoginTime: string | null,
): MeetPeopleMoreClientRequest => ({
  lastLoginTime,
});

/**
 * Route Handler→jambo-serverリクエスト作成関数
 */
export const createMeetPeopleMoreUpstreamRequest = (
  lastLoginTime: string | null,
): MeetPeopleMoreUpstreamRequest => {
  const request: MeetPeopleMoreUpstreamRequest = {
    api: JAMBO_API_ROUTE.MEET_PEOPLE,
    limit: 27,
    sort_type: 0,
    default_avatar_flag: false,
  };

  // lastLoginTimeがnullでない場合のみパラメータに含める
  if (lastLoginTime !== null) {
    return {
      ...request,
      last_login_time: lastLoginTime,
    };
  }

  return request;
};
