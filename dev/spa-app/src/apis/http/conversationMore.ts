import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ConversationMessage } from '@/services/conversation/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';
import type { ListConversationType } from '@/types/ListConversationType';

/**
 * Client → Route Handler リクエスト（CamelCase）
 */
export type ConversationMoreClientRequest = {
  readonly listType: ListConversationType;
  readonly timeStamp: string;
  readonly take?: number;
};

/**
 * Client ← Route Handler レスポンス
 */
export type ConversationMoreRouteResponse = ApiRouteResponse<
  ConversationMessage[]
>;

/**
 * Route Handler → jambo-server リクエスト（snake_case）
 */
export type ConversationMoreUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.LIST_CONVERSATION;
  readonly token: string;
  readonly take: number;
  readonly time_stamp: string | null;
  readonly unread_only: boolean;
  readonly conversating_only: boolean;
  readonly bookmark_only: boolean;
};

/**
 * jambo-server → Route Handler レスポンス
 *
 * ServerRawMessage型（regionはnumber | string）
 */
export type ConversationMoreUpstreamResponse = APIResponse<ServerRawMessage[]>;

type ServerRawMessage = Omit<ConversationMessage, 'region'> & {
  region: number | string;
};

/**
 * Client→Route Handlerリクエスト作成関数
 */
export const createConversationMoreClientRequest = (
  listType: ListConversationType,
  timeStamp: string,
  take: number = 15,
): ConversationMoreClientRequest => ({
  listType,
  timeStamp,
  take,
});

/**
 * Route Handler→jambo-serverリクエスト作成関数
 */
export const createConversationMoreUpstreamRequest = (
  token: string,
  listType: ListConversationType,
  timeStamp: string | null,
  take: number,
): ConversationMoreUpstreamRequest => ({
  api: JAMBO_API_ROUTE.LIST_CONVERSATION,
  token,
  take,
  time_stamp: timeStamp,
  unread_only: false,
  conversating_only: listType === 'conversation',
  bookmark_only: listType === 'bookmark',
});
