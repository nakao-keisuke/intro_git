import { useEffect } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { POLLING_GROUPS } from '@/services/polling/pollingGroups';
import type {
  TaskKey,
  TaskRequest,
  TaskResult,
} from '@/services/polling/types';
import { usePollingStore } from '@/stores/pollingStore';

/**
 * ポーリンググループコンポーネント
 *
 * 特定の間隔で複数タスクをポーリングし、結果をRecoil atomsに保存
 */
function PollingGroup({
  tasks,
  interval,
  enabled,
  getParams,
}: {
  tasks: TaskKey[];
  interval: number;
  enabled: boolean;
  getParams?: (taskKey: TaskKey) => Record<string, unknown> | undefined;
}) {
  // 各タスクの Zustand setter を取得（Hooks呼び出しはトップレベルで）
  const setUnreadCount = usePollingStore((s) => s.setUnreadCount);
  const setLiveUsers = usePollingStore((s) => s.setLiveUsers);
  const setChatHistory = usePollingStore((s) => s.setChatHistory);
  const setIncomingCall = usePollingStore((s) => s.setIncomingCall);
  const setListConversation = usePollingStore((s) => s.setListConversation);
  const setMyPoint = usePollingStore((s) => s.setMyPoint);
  const setUtagePolling = usePollingStore((s) => s.setUtagePolling);
  const setNewChat = usePollingStore((s) => s.setNewChat);

  // 動的ディスパッチ用の適用関数（型安全に key ごとに分岐）
  const applySetter = (taskKey: TaskKey, value: TaskResult) => {
    switch (taskKey) {
      case 'unreadCount':
        setUnreadCount(value as TaskResult<number>);
        break;
      case 'liveUsers':
        setLiveUsers(
          value as TaskResult<import('@/services/shared/type').LiveChannels>,
        );
        break;
      case 'chatHistory':
        setChatHistory(value as TaskResult);
        break;
      case 'incomingCall':
        setIncomingCall(value as TaskResult);
        break;
      case 'listConversation':
        setListConversation(
          value as TaskResult<
            import('@/services/conversation/type').ConversationListResponse
          >,
        );
        break;
      case 'myPoint':
        setMyPoint(value as TaskResult<{ point: number }>);
        break;
      case 'utagePolling':
        setUtagePolling(
          value as TaskResult<import('@/types/NewChat').NewChat[]>,
        );
        break;
      case 'newChat':
        setNewChat(value as TaskResult);
        break;
    }
  };

  // タスクリクエストを構築
  const taskRequests: TaskRequest[] = tasks.map((key) => {
    const params = getParams?.(key);
    return params ? { key, params } : { key };
  });

  // ポーリング実行
  const { data } = usePolling({
    tasks: taskRequests,
    refetchInterval: interval,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    enabled,
  });

  // 結果をRecoil atomsに保存
  useEffect(() => {
    if (!data) return;

    tasks.forEach((taskKey) => {
      const result = data[taskKey];
      if (result) {
        const taskResult: TaskResult = {
          ...(result.data !== undefined && { data: result.data }),
          ...(result.error !== undefined && { error: result.error }),
          updatedAt: Date.now(),
        };
        applySetter(taskKey, taskResult);
      }
    });
  }, [data, tasks]);

  return null; // UIは持たない
}

/**
 * グローバルポーリングプロバイダー
 *
 * 全ポーリンググループを一元管理
 * App Layoutの最上位に配置して使用
 */
export function PollingProvider({
  enabled = true,
  userToken,
  enablePaymentPolling = false,
}: {
  /** ポーリングを有効化するか */
  enabled?: boolean;
  /** ユーザートークン（必須パラメータ） */
  userToken?: string;
  /** 決済ポーリングを有効化するか（デフォルト: false） */
  enablePaymentPolling?: boolean;
}) {
  const latestTimeStamp = usePollingStore((s) => s.utagePollingLatestTimeStamp);

  // パラメータ生成関数
  const getParams = (taskKey: TaskKey) => {
    // 全タスクに共通でtokenを渡す
    if (!userToken) return undefined;

    const baseParams = {
      token: userToken,
    };

    if (taskKey === 'utagePolling') {
      return {
        ...baseParams,
        latestTimeStamp,
      };
    }

    return baseParams;
  };

  return (
    <>
      {/* 超高頻度グループ（1秒）- 決済チェック */}
      <PollingGroup
        tasks={POLLING_GROUPS.ultraHighFrequency.tasks}
        interval={POLLING_GROUPS.ultraHighFrequency.interval}
        enabled={enabled && enablePaymentPolling && !!userToken}
        getParams={getParams}
      />

      {/* 高頻度グループ（3秒）- メッセージ・ライブ・未読 */}
      <PollingGroup
        tasks={POLLING_GROUPS.highFrequency.tasks}
        interval={POLLING_GROUPS.highFrequency.interval}
        enabled={enabled && !!userToken}
        getParams={getParams}
      />

      {/* 中頻度グループ（5秒）- チャット履歴 */}
      <PollingGroup
        tasks={POLLING_GROUPS.mediumFrequency.tasks}
        interval={POLLING_GROUPS.mediumFrequency.interval}
        enabled={enabled && !!userToken}
        getParams={getParams}
      />

      {/* 低頻度グループ（30秒）- ランキング */}
      <PollingGroup
        tasks={POLLING_GROUPS.lowFrequency.tasks}
        interval={POLLING_GROUPS.lowFrequency.interval}
        enabled={enabled && !!userToken}
        getParams={getParams}
      />
    </>
  );
}
