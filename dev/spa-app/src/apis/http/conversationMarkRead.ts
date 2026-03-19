import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

/**
 * Client → Route Handler リクエスト（CamelCase）
 */
export type ConversationMarkReadClientRequest = {
  readonly partnerIds: string[];
};

/**
 * Client ← Route Handler レスポンス
 */
export type ConversationMarkReadRouteResponse = ApiRouteResponse<void>;

/**
 * Route Handler → jambo-server リクエスト（snake_case）
 */
export type ConversationMarkReadUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.MARK_READS;
  readonly token: string;
  readonly frd_id: string[];
};

/**
 * Client→Route Handlerリクエスト作成関数
 */
export const createConversationMarkReadClientRequest = (
  partnerIds: string[],
): ConversationMarkReadClientRequest => ({
  partnerIds,
});

/**
 * Route Handler→jambo-serverリクエスト作成関数
 */
export const createConversationMarkReadUpstreamRequest = (
  token: string,
  partnerIds: string[],
): ConversationMarkReadUpstreamRequest => ({
  api: JAMBO_API_ROUTE.MARK_READS,
  token,
  frd_id: partnerIds,
});
