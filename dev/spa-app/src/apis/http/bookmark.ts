import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

// Route Handler ⇔ Client の汎用レスポンス
export type BookmarkRouteResponse = ApiRouteResponse<undefined>;

// Jambo 向け Request（snake_case）
export type AddBookmarkRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.ADD_BOOKMARK;
  readonly token: string;
  readonly partner_id: string;
};

export type DeleteBookmarkRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.DELETE_BOOKMARK;
  readonly token: string;
  readonly partner_id: string;
};

export const createAddBookmarkRequest = (
  token: string,
  partnerId: string,
): AddBookmarkRequest => ({
  api: JAMBO_API_ROUTE.ADD_BOOKMARK,
  token,
  partner_id: partnerId,
});

export const createDeleteBookmarkRequest = (
  token: string,
  partnerId: string,
): DeleteBookmarkRequest => ({
  api: JAMBO_API_ROUTE.DELETE_BOOKMARK,
  token,
  partner_id: partnerId,
});

// Jambo のレスポンスは code のみを見れば十分（data なし）
export type BookmarkUpstreamResponse = APIResponse<null>;
