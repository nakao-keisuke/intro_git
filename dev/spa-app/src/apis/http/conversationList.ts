import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ResponseData } from '@/types/NextApi';
import type { Region } from '@/utils/region';

export type ListType = 'all' | 'conversation' | 'bookmark';

export type ConversationListClientRequest = {
  readonly listType: ListType;
};

/** Route Handler レスポンス用の型（region は変換済み） */
export type ConversationListItem = {
  readonly frdId: string;
  readonly frdName: string;
  readonly isOnline: boolean;
  readonly lastMsg: string;
  readonly isOwn: boolean;
  readonly sentTime: string;
  readonly unreadNum: number;
  readonly avaId: string;
  readonly gender: 0 | 1 | 2;
  readonly msgType: string | undefined;
  readonly voiceCallWaiting: boolean;
  readonly videoCallWaiting: boolean;
  readonly oneBeforeMsgType: string | undefined;
  readonly isNewUser: boolean;
  readonly hasLovense: boolean;
  readonly region: Region;
  readonly age: number;
  readonly isListedOnFleaMarket: boolean;
};

/** Upstream (jambo-server) からのレスポンス用の型 */
export type ConversationListUpstreamItem = {
  readonly frdId: string;
  readonly frdName: string;
  readonly isOnline: boolean;
  readonly lastMsg: string;
  readonly isOwn: boolean;
  readonly sentTime: string;
  readonly unreadNum: number;
  readonly avaId: string;
  readonly gender: 0 | 1 | 2;
  readonly msgType: string | undefined;
  readonly voiceCallWaiting: boolean;
  readonly videoCallWaiting: boolean;
  readonly oneBeforeMsgType: string | undefined;
  readonly isNewUser: boolean;
  readonly hasLovense: boolean;
  readonly region: number | string;
  readonly age: number;
  readonly isListedOnFleaMarket: boolean;
};

export type ConversationListRouteResponse = ResponseData<{
  readonly list: ConversationListItem[];
}>;

export type ConversationListUpstreamRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.LIST_CONVERSATION;
  readonly token: string;
  readonly take: 15;
  readonly time_stamp: string | null;
  readonly unread_only: boolean;
  readonly conversating_only: boolean;
  readonly bookmark_only: boolean;
};

export type ConversationListUpstreamResponse = APIResponse<
  ConversationListUpstreamItem[]
>;

export const createConversationListUpstreamRequest = (
  token: string,
  listType: ListType,
): ConversationListUpstreamRequest => ({
  api: JAMBO_API_ROUTE.LIST_CONVERSATION,
  token,
  take: 15,
  unread_only: false,
  conversating_only: listType === 'conversation',
  bookmark_only: listType === 'bookmark',
  time_stamp: null,
});
