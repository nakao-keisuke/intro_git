import type { ListConversationElementResponseData } from '@/apis/list-conversation';
import type { UtageWebGetLiveChannelsResponseData } from '@/apis/utage-web-get-live-channels';
import type { LiveCallType } from '@/utils/callView';
import { lastMessage, sentTimeString } from '@/utils/messageUtil';

export type TopMessage = {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly isOnline: boolean;
  readonly lastMessage: string;
  readonly isOwn: boolean;
  readonly sentTime: string;
  readonly unreadNum: number;
  readonly avatarId: string;
  readonly voiceCallWaiting: boolean;
  readonly videoCallWaiting: boolean;
  readonly timeStamp: string;
  readonly oneBeforeMsgType: string | null;
  readonly msgType: string | null;
  readonly liveCallType: LiveCallType | null;
  readonly isNewUser: boolean;
  readonly isSystemAccount?: boolean;
  readonly hasLovense: boolean;
};

/**
 * チャット一覧のデータをTopMessage型に変換する
 * @param chatList チャット一覧のデータ
 * @param liveChannelData ライブ配信データ
 * @returns TopMessage型の配列
 */
export const convertChatListToTopMessages = (
  chatList: ListConversationElementResponseData[],
  liveChannelData?: UtageWebGetLiveChannelsResponseData,
): TopMessage[] => {
  return chatList.map((item) => {
    // 配信待機中のチャンネルIDを取得
    const standbyChannelId = liveChannelData?.standbyList.find(
      (e) => e.broadcaster.user_id === item.frd_id,
    )?.channelInfo.channel_id;

    // 配信中のチャンネルIDを取得
    const inLiveChannelId = liveChannelData?.inLiveList.find(
      (e) => e.broadcaster.user_id === item.frd_id,
    )?.channelInfo.channel_id;

    // ライブ配信中か配信待機中かどうかを判断
    let liveCallType: LiveCallType | null = null;
    if (standbyChannelId) {
      liveCallType = standbyChannelId.includes('video')
        ? 'videoCallFromStandby'
        : 'live';
    }
    if (inLiveChannelId) {
      liveCallType = 'live';
    }

    // TopMessage型に変換
    const topMessage: TopMessage = {
      partnerId: item.frd_id ?? '',
      partnerName: item.frd_name ?? '',
      isOnline: item.is_online ?? false,
      lastMessage: lastMessage(
        item.msg_type ?? '',
        item.last_msg ?? '',
        item.is_own ?? false,
      ),
      isOwn: item.is_own ?? false,
      sentTime: sentTimeString(item.sent_time ?? ''),
      unreadNum: item.unread_num ?? 0,
      avatarId: item.ava_id ?? '',
      voiceCallWaiting: item.voice_call_waiting ?? false,
      videoCallWaiting: item.video_call_waiting ?? false,
      timeStamp: item.sent_time ?? '',
      oneBeforeMsgType: item.one_before_msg_type ?? null,
      msgType: item.msg_type ?? null,
      liveCallType: liveCallType,
      isNewUser: item.is_new_user ?? false,
      isSystemAccount: item.frd_id === import.meta.env.MANAGEMENT_ACCOUNT_ID,
      hasLovense: item.has_lovense ?? false,
    };

    return topMessage;
  });
};
