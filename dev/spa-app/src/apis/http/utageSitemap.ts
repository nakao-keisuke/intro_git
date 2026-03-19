import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ResponseData } from '@/types/NextApi';

export type GetActiveUsersForUtageSitemapResponse = {
  readonly partner_ids: string[];
};

export type GetActiveUsersForUtageSitemapRouteResponse =
  ResponseData<GetActiveUsersForUtageSitemapResponse>;

export type GetActiveUsersForUtageSitemapRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_ACTIVE_USERS_FOR_UTAGE_SITEMAP;
};

export type UtageSitemapUpstreamData = {
  readonly users?: string[];
};

export type UtageSitemapUpstreamResponse =
  APIResponse<UtageSitemapUpstreamData>;

export const createGetActiveUsersForUtageSitemapRequest =
  (): GetActiveUsersForUtageSitemapRequest => ({
    api: JAMBO_API_ROUTE.GET_ACTIVE_USERS_FOR_UTAGE_SITEMAP,
  });
