import { useMemo } from 'react';
import { usePollingStore } from '@/stores/pollingStore';

/**
 * ポーリングデータ取得用カスタムフック
 *
 * 各タスクの結果をRecoil atomsから取得
 * コンポーネントはこれらのhooksを使用してデータを読み取る
 */

/**
 * 未読数を取得
 *
 * @returns 未読数データ
 * @example
 * ```tsx
 * const unreadCount = useUnreadCount();
 * if (unreadCount?.data) {
 *   return <Badge count={unreadCount.data} />;
 * }
 * ```
 */
export function useUnreadCount() {
  return usePollingStore((s) => s.unreadCount);
}

/**
 * ライブユーザー一覧を取得
 *
 * @returns ライブユーザーデータと状態判定関数
 * @example
 * ```tsx
 * const { data: liveUsersData, getLiveCallType } = useLiveUsers();
 * const liveCallType = getLiveCallType(partnerId);
 * const isLiveStreaming = liveCallType === 'live';
 * ```
 */
export function useLiveUsers() {
  const liveUsersData = usePollingStore((s) => s.liveUsers);

  /**
   * 特定ユーザーのライブ状態を判定
   *
   * @param userId - 判定対象のユーザーID
   * @param videoChatWaiting - ユーザーのvideoChatWaitingフラグ（オプション）
   * @returns 'live' | 'videoCallFromStandby' | null
   */
  const getLiveCallType = useMemo(() => {
    return (userId: string): 'live' | 'videoCallFromStandby' | null => {
      const liveChannelsResult = liveUsersData?.data ?? null;
      let type: 'live' | 'videoCallFromStandby' | null = null;

      if (liveChannelsResult) {
        const { inLiveList, standbyList } = liveChannelsResult;
        // inLiveListに存在する場合は「配信中」
        const isInLive = inLiveList?.some(
          (channel) => channel.broadcaster.userId === userId,
        );
        // standbyListに存在する場合は「配信待機中」
        const standbyChannel = standbyList?.find(
          (channel) => channel.broadcaster.userId === userId,
        );

        if (isInLive) {
          type = 'live';
        } else if (standbyChannel) {
          type = 'videoCallFromStandby';
        }
      }
      return type;
    };
  }, [liveUsersData?.data, liveUsersData?.updatedAt]);

  return useMemo(
    () => ({ data: liveUsersData, getLiveCallType }),
    [liveUsersData, getLiveCallType],
  );
}

/**
 * チャット履歴を取得
 *
 * @returns チャット履歴データ
 */
export function useChatHistory() {
  return usePollingStore((s) => s.chatHistory);
}

/**
 * 着信情報を取得
 *
 * @returns 着信情報データ
 * @example
 * ```tsx
 * const incomingCall = useIncomingCall();
 * if (incomingCall?.data) {
 *   return <IncomingCallAlert call={incomingCall.data} />;
 * }
 * ```
 */
export function useIncomingCall() {
  return usePollingStore((s) => s.incomingCall);
}

/**
 * 会話一覧を取得
 *
 * @returns 会話一覧データ
 */
export function useListConversation() {
  return usePollingStore((s) => s.listConversation);
}

/**
 * 所持ポイントを取得
 *
 * @returns ポイントデータ
 * @example
 * ```tsx
 * const myPoint = useMyPoint();
 * if (myPoint?.data) {
 *   return <div>保有ポイント: {myPoint.data.point}P</div>;
 * }
 * ```
 */
export function useMyPoint() {
  return usePollingStore((s) => s.myPoint);
}

/**
 * Utageポーリングデータを取得
 *
 * @returns Utageポーリングデータ
 */
export function useUtagePolling() {
  return usePollingStore((s) => s.utagePolling);
}

/**
 * 新着チャットを取得
 *
 * @returns 新着チャットデータ
 */
export function useNewChat() {
  return usePollingStore((s) => s.newChat);
}

/**
 * お気に入り配信情報を取得
 *
 * @returns お気に入り配信情報データ
 */
export function useBookmarkStreamInfo() {
  return usePollingStore((s) => s.bookmarkStreamInfo);
}

/**
 * 複数のポーリングデータを一度に取得
 *
 * @returns 全ポーリングデータ
 * @example
 * ```tsx
 * const polling = useAllPollingData();
 * return (
 *   <div>
 *     <div>未読: {polling.unreadCount?.data}</div>
 *     <div>ポイント: {polling.myPoint?.data?.point}P</div>
 *     {polling.liveUsers.data && <LiveUserList data={polling.liveUsers.data} />}
 *   </div>
 * );
 * ```
 */
export function useAllPollingData() {
  const liveUsersResult = useLiveUsers();
  return {
    unreadCount: useUnreadCount(),
    liveUsers: liveUsersResult,
    chatHistory: useChatHistory(),
    incomingCall: useIncomingCall(),
    listConversation: useListConversation(),
    myPoint: useMyPoint(),
    utagePolling: useUtagePolling(),
    newChat: useNewChat(),
    bookmarkStreamInfo: useBookmarkStreamInfo(),
  };
}
