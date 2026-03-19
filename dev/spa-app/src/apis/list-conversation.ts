import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface ListConversationRequest extends JamboRequest {
  readonly api: 'list_conversation';
  readonly token: string;
  readonly take: 15;
  readonly time_stamp: string | null;
  readonly unread_only: boolean;
  readonly conversating_only: boolean;
  readonly bookmark_only: boolean;
}

export interface ListConversationElementResponseData extends JamboResponseData {
  readonly frd_id: string;
  readonly frd_name: string;
  readonly is_online: boolean;
  readonly last_msg: string;
  readonly is_own: boolean;
  readonly sent_time: string;
  readonly unread_num: number;
  readonly ava_id: string;
  readonly gender: 0 | 1 | 2;
  readonly msg_type: string | undefined;
  readonly voice_call_waiting: boolean;
  readonly video_call_waiting: boolean;
  readonly one_before_msg_type: string | undefined;
  readonly is_new_user: boolean;
  readonly has_lovense: boolean;
  readonly region: number;
  readonly age: number;
  readonly is_listed_on_flea_market: boolean;
}

/**
 * @param token ユーザー認証トークン
 * @param type all | conversation | bookmark
 *
 * このファイルは、会話リストを取得するためのAPIリクエストとレスポンスの型定義を担当します。
 * listConversationRequest関数は、指定されたタイプの会話リストを取得するためのリクエストを生成します。
 * ListConversationElementResponseDataインターフェースは、APIから返される会話リストの各要素のデータ構造を定義します。
 */
export const listConversationRequest = (
  token: string,
  type: 'all' | 'conversation' | 'bookmark',
  timeStamp?: string,
): ListConversationRequest => ({
  api: 'list_conversation',
  token: token,
  take: 15,
  unread_only: false,
  conversating_only: type === 'conversation',
  bookmark_only: type === 'bookmark',
  time_stamp: timeStamp || null,
});
