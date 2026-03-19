import { useCallback, useEffect, useRef, useState } from 'react';
import { usePolling } from '@/hooks/usePolling';
import {
  TASK_POLLING_CONFIG,
  UNIFIED_POLLING_INTERVAL,
  UTAGE_WEB_POLLING_TAKE,
} from '@/services/polling/pollingConfig';
import type {
  TaskKey,
  TaskRequest,
  TaskResult,
} from '@/services/polling/types';
import { TASK_KEYS } from '@/services/polling/types';
import { useCallStore } from '@/stores/callStore';
import { usePollingStore } from '@/stores/pollingStore';
import type { NewChat } from '@/types/NewChat';

/**
 * 通知済みIDキャッシュの最大サイズ（メモリリーク防止）
 * 通常は10件×2〜3回分のポーリング結果で十分
 */
const MAX_NOTIFIED_IDS_CACHE_SIZE = 50;

/**
 * 統合ポーリングプロバイダー
 *
 * 全タスクを1つのポーリングで管理し、各タスクの間隔を個別制御
 * これにより、常に最大1つの同時ポーリングリクエストのみを発生させる
 *
 * @example
 * ```tsx
 * <UnifiedPollingProvider
 *   enabled={true}
 *   userToken={userToken}
 *   getParams={(key) => ({ token: userToken })}
 * >
 *   {children}
 * </UnifiedPollingProvider>
 * ```
 */
export function UnifiedPollingProvider({
  enabled = true,
  userToken,
  getParams,
}: {
  /** ポーリングを有効化するか */
  enabled?: boolean;
  /** ユーザートークン（必須パラメータ） */
  userToken?: string;
  /** タスク固有のパラメータを取得する関数 */
  getParams?: (taskKey: TaskKey) => Record<string, unknown> | undefined;
}) {
  // 各タスクの最終ポーリング時刻を記録（全キーを0で初期化）
  const initialLastPollTime: Record<TaskKey, number> = Object.fromEntries(
    TASK_KEYS.map((k) => [k, 0]),
  ) as Record<TaskKey, number>;
  const lastPollTimeRef = useRef<Record<TaskKey, number>>(initialLastPollTime);

  // 初回ポーリング完了フラグ（ページロード時の全タスク即時発射と通話終了後の再開を区別）
  const hasInitializedRef = useRef(false);

  // chatHistory動的制御用の設定を取得（Zustandに移行）
  const chatHistoryConfig = usePollingStore((s) => s.chatHistoryPollingConfig);

  // 通話中かどうかを判定（通話中はポーリングを停止）
  const callDurationSec = useCallStore((s) => s.callDurationSec);

  // Zustand setters
  const setMyPointZustand = usePollingStore((s) => s.setMyPoint);
  const setUnreadCountZustand = usePollingStore((s) => s.setUnreadCount);
  const setLiveUsersZustand = usePollingStore((s) => s.setLiveUsers);
  const setListConversationZustand = usePollingStore(
    (s) => s.setListConversation,
  );
  const setNewChatZustand = usePollingStore((s) => s.setNewChat);
  const setChatHistoryZustand = usePollingStore((s) => s.setChatHistory);
  const setIncomingCallZustand = usePollingStore((s) => s.setIncomingCall);
  const setUtagePollingZustand = usePollingStore((s) => s.setUtagePolling);
  const setBookmarkStreamInfoZustand = usePollingStore(
    (s) => s.setBookmarkStreamInfo,
  );

  const applySetter = (taskKey: TaskKey, value: TaskResult) => {
    switch (taskKey) {
      case 'unreadCount':
        // Zustand に移行
        setUnreadCountZustand(value as TaskResult<number>);
        break;
      case 'liveUsers':
        // Zustand に移行
        setLiveUsersZustand(
          value as TaskResult<import('@/services/shared/type').LiveChannels>,
        );
        break;
      case 'chatHistory':
        // Zustand に移行
        setChatHistoryZustand(value as TaskResult);
        break;
      case 'incomingCall':
        // Zustand に移行
        setIncomingCallZustand(value as TaskResult);
        break;
      case 'listConversation':
        // Zustand に移行
        setListConversationZustand(
          value as TaskResult<
            import('@/services/conversation/type').ConversationListResponse
          >,
        );
        break;
      case 'myPoint':
        // Zustand に移行
        setMyPointZustand(value as TaskResult<{ point: number }>);
        break;
      case 'utagePolling':
        // Zustand に移行
        setUtagePollingZustand(
          value as TaskResult<import('@/types/NewChat').NewChat[]>,
        );
        break;
      case 'newChat':
        // Zustand に移行
        setNewChatZustand(value as TaskResult);
        break;
      case 'bookmarkStreamInfo':
        setBookmarkStreamInfoZustand(
          value as TaskResult<
            import('@/services/polling/types').QuickJoinBookmarkStreamInfo
          >,
        );
        break;
    }
  };

  // utagePolling（新着チャット）制御用の内部状態
  const latestTimeStampRef = useRef<string | undefined>(undefined);
  const pendingQueueRef = useRef<NewChat[]>([]);
  const drainingRef = useRef(false);
  const notifiedSetRef = useRef<Set<string>>(new Set());
  // アンマウント後のdrainQueue継続を防止するフラグ
  const mountedRef = useRef(true);
  const persistedLatestTs = usePollingStore(
    (s) => s.utagePollingLatestTimeStamp,
  );
  const setPersistedLatestTs = usePollingStore(
    (s) => s.setUtagePollingLatestTimeStamp,
  );

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // 現在時刻のJST 14桁タイムスタンプ（yyyyMMddHHmmss）を生成
  const nowTimestampJST14 = (offsetSeconds = 0) => {
    const now = new Date(Date.now() + offsetSeconds * 1000);

    // JSTに変換（UTC + 9時間）
    const jstOffset = 9 * 60 * 60 * 1000; // 9時間をミリ秒に変換
    const jstDate = new Date(now.getTime() + jstOffset);

    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
      jstDate.getUTCFullYear().toString() +
      pad(jstDate.getUTCMonth() + 1) +
      pad(jstDate.getUTCDate()) +
      pad(jstDate.getUTCHours()) +
      pad(jstDate.getUTCMinutes()) +
      pad(jstDate.getUTCSeconds())
    );
  };

  // アンマウント時にdrainQueueを停止
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const drainQueue = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    try {
      while (pendingQueueRef.current.length > 0 && mountedRef.current) {
        const next = pendingQueueRef.current.shift();
        if (!next) break;
        try {
          if (!next.id) {
            continue;
          }
          // newChat (Zustand) へ1件ずつ流す
          const taskResult: TaskResult = {
            data: next,
            updatedAt: Date.now(),
          };
          setNewChatZustand(taskResult);
          notifiedSetRef.current.add(next.id);
        } catch (err) {
          console.error('utagePolling drain error:', err);
        }
        // Toast の autoClose(約3700ms) を考慮して少し余裕を持って待機
        await sleep(4000);
      }
    } finally {
      drainingRef.current = false;
    }
  }, [setNewChatZustand]);

  // 現在ポーリングすべきタスクを決定
  const getTasksToPoll = useCallback((): TaskKey[] => {
    // 通話中はポーリングを停止
    if (callDurationSec !== undefined) {
      return [];
    }

    const now = Date.now();
    const tasksToPoll: TaskKey[] = [];

    Object.entries(TASK_POLLING_CONFIG).forEach(([key, config]) => {
      const taskKey = key as TaskKey;

      // chatHistoryは動的制御（chatHistoryConfigで制御）
      if (taskKey === 'chatHistory') {
        if (!chatHistoryConfig.enabled) {
          return;
        }
      } else {
        // その他のタスクはデフォルト設定に従う
        if (!config.enabled) {
          return;
        }
      }

      // 最終ポーリング時刻を取得
      const lastPollTime = lastPollTimeRef.current[taskKey] || 0;

      // 間隔が経過していればポーリング対象
      if (now - lastPollTime >= config.interval) {
        tasksToPoll.push(taskKey);
      }
    });

    return tasksToPoll;
  }, [callDurationSec, chatHistoryConfig]);

  // ポーリングすべきタスクのリストを状態として管理
  const [tasksToPoll, setTasksToPoll] = useState<TaskKey[]>([]);

  // 1秒ごとにポーリング対象を更新
  useEffect(() => {
    if (!enabled || !userToken) {
      setTasksToPoll([]);
      return;
    }

    // 通話中はポーリングを停止（intervalも張らない）
    if (callDurationSec !== undefined) {
      setTasksToPoll([]);
      return;
    }

    // 初回起動時: 永続化されたlatestTimeStampがあれば優先し、なければ "現在時刻-60秒（JST）" を使用
    if (!latestTimeStampRef.current) {
      latestTimeStampRef.current = persistedLatestTs ?? nowTimestampJST14(-60);
    }

    let readyStateListener: (() => void) | undefined;

    if (!hasInitializedRef.current) {
      // ページロード時の初回: document.readyState === 'complete' を待ってからポーリング開始
      // SSRストリーミング完了前にポーリングを開始すると、Sentry BrowserTracingの
      // idleSpanがポーリングのHTTPスパンにより終了できず、finalTimeout（30秒）に到達してしまう
      hasInitializedRef.current = true;

      const startInitialPolling = () => {
        const initialTasks = Object.keys(TASK_POLLING_CONFIG).filter((key) => {
          const taskKey = key as TaskKey;
          if (taskKey === 'chatHistory') {
            return chatHistoryConfig.enabled;
          }
          return TASK_POLLING_CONFIG[taskKey].enabled;
        }) as TaskKey[];

        setTasksToPoll(initialTasks);
      };

      if (document.readyState === 'complete') {
        startInitialPolling();
      } else {
        const listener = () => {
          if (document.readyState === 'complete') {
            startInitialPolling();
            document.removeEventListener('readystatechange', listener);
            readyStateListener = undefined;
          }
        };
        readyStateListener = listener;
        document.addEventListener('readystatechange', listener);
      }
    } else {
      // 通話終了後の再開: lastPollTimeを現在時刻にリセットし、
      // 各タスクが設定されたinterval後に自然に再開されるようにする
      // これにより全タスクの同時発射（thundering herd）を防止
      const now = Date.now();
      for (const key of TASK_KEYS) {
        lastPollTimeRef.current[key] = now;
      }
    }

    // 定期的にポーリング対象を更新
    const interval = setInterval(() => {
      const tasks = getTasksToPoll();
      if (tasks.length > 0) {
        setTasksToPoll(tasks);
      }
    }, UNIFIED_POLLING_INTERVAL);

    return () => {
      clearInterval(interval);
      if (readyStateListener) {
        document.removeEventListener('readystatechange', readyStateListener);
      }
    };
  }, [enabled, userToken, callDurationSec, chatHistoryConfig, getTasksToPoll]);

  // タスクリクエストを構築
  const taskRequests: TaskRequest[] = tasksToPoll.map((key) => {
    let params = getParams?.(key) || (userToken ? { token: userToken } : {});

    // chatHistoryの場合、partnerIdを追加
    if (key === 'chatHistory' && chatHistoryConfig.partnerId) {
      params = {
        ...params,
        frd_id: chatHistoryConfig.partnerId,
      };
    }

    // utagePollingの場合、latestTimeStampとtakeを追加
    if (key === 'utagePolling' && latestTimeStampRef.current) {
      params = {
        ...params,
        latestTimeStamp: latestTimeStampRef.current, // JST 14桁形式
        take: UTAGE_WEB_POLLING_TAKE, // 取得件数（10件）
      } as Record<string, unknown>;
    }

    return { key, params };
  });

  // ポーリング実行（タスクがある場合のみ）
  const { data } = usePolling({
    tasks: taskRequests,
    refetchInterval: 0, // 手動で制御するので0（無効）
    enabled: enabled && tasksToPoll.length > 0 && !!userToken,
  });

  // 結果をRecoil atomsに保存
  useEffect(() => {
    if (!data) return;

    const now = Date.now();

    tasksToPoll.forEach((taskKey) => {
      const result = data[taskKey];
      if (result) {
        // utagePolling（配列）を newChat のキューへ投入
        if (taskKey === 'utagePolling' && result.data) {
          const arr = Array.isArray(result.data)
            ? (result.data as NewChat[])
            : [];
          if (arr.length > 0) {
            // 昇順（古い→新しい）で順番に表示されるよう担保
            const sorted = [...arr].sort((a, b) =>
              a.timeStamp.localeCompare(b.timeStamp),
            );

            // 初回ウォームアップ判定（まだ通知済み集合が空の場合、トーストには出さず基準TSのみ更新）
            const maxTsWarmup = sorted[sorted.length - 1]?.timeStamp;
            const isFirstPolling = !notifiedSetRef.current.size;
            const needsTimestampInit =
              !latestTimeStampRef.current ||
              (maxTsWarmup && maxTsWarmup > (latestTimeStampRef.current ?? ''));

            if (isFirstPolling && needsTimestampInit) {
              latestTimeStampRef.current = maxTsWarmup;
              setPersistedLatestTs(maxTsWarmup);
            } else {
              for (const item of sorted) {
                if (!notifiedSetRef.current.has(item.id)) {
                  pendingQueueRef.current.push(item);
                }
              }

              // Setサイズのチェックとクリア（メモリリーク防止）
              if (notifiedSetRef.current.size > MAX_NOTIFIED_IDS_CACHE_SIZE) {
                notifiedSetRef.current.clear();
                // キュー内のIDを再追加（未表示のメッセージIDを保持）
                pendingQueueRef.current.forEach((item) => {
                  notifiedSetRef.current.add(item.id);
                });
              }

              // latestTimeStampを現在時刻（JST）に更新
              // Jambo APIは time_stamp「まで」のデータを取得するため、
              // 次回のポーリングで最新のデータを確実に取得できるようにする
              if (sorted.length > 0) {
                const nowJST = nowTimestampJST14(0); // 現在時刻（JST 14桁）
                latestTimeStampRef.current = nowJST;
                setPersistedLatestTs(nowJST);
              }
              // キューを排出
              void drainQueue();
            }
          }
        }

        const taskResult: TaskResult = {
          ...(result.data !== undefined && { data: result.data }),
          ...(result.error !== undefined && { error: result.error }),
          updatedAt: now,
        };

        applySetter(taskKey, taskResult);

        // 最終ポーリング時刻を更新
        lastPollTimeRef.current[taskKey] = now;
      }
    });

    // 次のポーリング対象をクリア（次の間隔で再計算される）
    setTasksToPoll([]);
  }, [data, tasksToPoll]);

  return null; // UIは持たない
}
