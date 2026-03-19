import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
// ServerHttpClient removed - use ClientHttpClient in SPA
import { extractClientIp } from '@/utils/ip';
import { UTAGE_WEB_POLLING_TAKE } from './pollingConfig';
import type {
  TaskContext,
  TaskExecutor,
  TaskKey,
  TaskRequest,
  TaskRunner,
} from './types';

/**
 * Jambo APIのルートURL
 */
const JAMBO_ROOT = `${import.meta.env.API_URL || ''}/`;

/**
 * ヘッダーからクライアントIPを取得
 *
 * @param headers リクエストヘッダー
 * @returns クライアントIP（取得できない場合は '0.0.0.0'）
 */
function getClientIpFromHeaders(headers: Headers): string {
  // Headers を Record<string, string> に変換
  const headersRecord: Record<string, string> = {};
  headers.forEach((value, key) => {
    headersRecord[key] = value;
  });

  const ip = extractClientIp(headersRecord);

  // IPが取得できない場合はデフォルト値
  return ip || '0.0.0.0';
}

/**
 * トークンをパラメータから取得
 *
 * @param params タスクパラメータ
 * @returns トークン（存在しない場合は undefined）
 */
function getToken(
  params: Record<string, unknown> | undefined,
): string | undefined {
  return params?.token as string | undefined;
}

/**
 * タスク実行マップ
 * 各TaskKeyに対応する実行関数を定義
 */
const TASK_EXECUTORS: Record<TaskKey, TaskExecutor> = {
  /**
   * 未読数取得
   * Jambo API: total_unread
   */
  unreadCount: (params, ctx) => {
    const ip = getClientIpFromHeaders(ctx.headers);
    const token = getToken(params);

    const body = {
      api: JAMBO_API_ROUTE.TOTAL_UNREAD,
      ip,
      token,
    };

    return serverHttpClient.post(JAMBO_ROOT, body, { timeoutMs: 4000 });
  },

  /**
   * ライブユーザー一覧取得
   * Jambo API: second_apps_get_live_channels
   */
  liveUsers: (params, ctx) => {
    const ip = getClientIpFromHeaders(ctx.headers);
    const token = getToken(params);

    const body = {
      api: JAMBO_API_ROUTE.LIVE_USERS,
      ip,
      token,
      call_type: 'live',
    };

    return serverHttpClient.post(JAMBO_ROOT, body, { timeoutMs: 4000 });
  },

  /**
   * チャット履歴取得（購入済みメディア情報も含む）
   * Jambo API: get_chat_history + get_chat_file_archive + get_opened_audio
   */
  chatHistory: async (params, ctx) => {
    const ip = getClientIpFromHeaders(ctx.headers);
    const token = getToken(params);
    const frd_id = params?.frd_id as string | undefined;
    const time_stamp = (params?.time_stamp as string) || '';
    const take = (params?.take as number) || 20;

    // チャット履歴と購入済みメディア情報を並列で取得
    const [chatHistoryRes, fileArchiveRes, audioRes] = await Promise.all([
      serverHttpClient.post(
        JAMBO_ROOT,
        {
          api: JAMBO_API_ROUTE.GET_CHAT_HISTORY,
          ip,
          token,
          frd_id,
          time_stamp,
          take,
        },
        { timeoutMs: 5000 },
      ),
      serverHttpClient.post(
        JAMBO_ROOT,
        {
          api: JAMBO_API_ROUTE.GET_CHAT_FILE_ARCHIVE,
          ip,
          token,
          partner_id: frd_id,
        },
        { timeoutMs: 5000 },
      ),
      serverHttpClient.post(
        JAMBO_ROOT,
        {
          api: JAMBO_API_ROUTE.GET_OPENED_AUDIO,
          ip,
          token,
        },
        { timeoutMs: 5000 },
      ),
    ]);

    // 3つのレスポンスを統合して返す（正規化はnormalizers.tsで実行）
    return {
      chatHistory: chatHistoryRes,
      fileArchive: fileArchiveRes,
      openedAudio: audioRes,
    };
  },

  /**
   * 着信情報取得
   * Jambo API: get_web_incoming_call
   */
  incomingCall: (params, ctx) => {
    const ip = getClientIpFromHeaders(ctx.headers);
    const token = getToken(params);

    const body = {
      api: JAMBO_API_ROUTE.GET_WEB_INCOMING_CALL,
      ip,
      token,
    };

    return serverHttpClient.post(JAMBO_ROOT, body, { timeoutMs: 3000 });
  },

  /**
   * 会話一覧取得
   * Jambo API: list_conversation
   */
  listConversation: (params, ctx) => {
    const ip = getClientIpFromHeaders(ctx.headers);
    const token = getToken(params);
    const take = (params?.take as number) || 15;
    const time_stamp = params?.time_stamp || null;
    const unread_only = (params?.unread_only as boolean) || false;
    const conversating_only = (params?.conversating_only as boolean) || false;
    const bookmark_only = (params?.bookmark_only as boolean) || false;

    const body = {
      api: JAMBO_API_ROUTE.LIST_CONVERSATION,
      ip,
      token,
      take,
      time_stamp,
      unread_only,
      conversating_only,
      bookmark_only,
    };

    return serverHttpClient.post(JAMBO_ROOT, body, { timeoutMs: 4000 });
  },

  /**
   * Utageポーリング
   * Jambo API: utage_web_polling
   */
  utagePolling: (params, ctx) => {
    const ip = getClientIpFromHeaders(ctx.headers);
    const token = getToken(params);
    const take = UTAGE_WEB_POLLING_TAKE; // 取得件数（10件）
    const time_stamp = params?.latestTimeStamp as string | undefined; // JST 14桁形式

    const body = {
      api: JAMBO_API_ROUTE.UTAGE_WEB_POLLING,
      ip,
      token,
      take, // 取得件数制限
      time_stamp, // この時刻以降のメッセージを取得
    };

    return serverHttpClient.post(JAMBO_ROOT, body, { timeoutMs: 4000 });
  },

  /**
   * 所持ポイント取得
   * Jambo API: get_specified_user_point
   */
  myPoint: (params, ctx) => {
    const ip = getClientIpFromHeaders(ctx.headers);
    const token = getToken(params);
    // partner_user_id は params.user_id を使用
    const partner_user_id = params?.user_id as string | undefined;

    const body = {
      api: JAMBO_API_ROUTE.GET_SPECIFIED_USER_POINT,
      ip,
      token,
      partner_user_id,
    };

    return serverHttpClient.post(JAMBO_ROOT, body, { timeoutMs: 3000 });
  },

  /**
   * 新着チャット取得
   * Jambo API: get_new_chat
   * TODO: 既存API実装を確認して正確なパラメータを設定
   */
  newChat: (params, ctx) => {
    const ip = getClientIpFromHeaders(ctx.headers);
    const token = getToken(params);
    const latest_time_stamp = params?.latest_time_stamp as string | undefined;

    const body = {
      api: JAMBO_API_ROUTE.GET_NEW_CHAT,
      ip,
      token,
      latest_time_stamp,
    };

    return serverHttpClient.post(JAMBO_ROOT, body, { timeoutMs: 4000 });
  },

  /**
   * お気に入り配信情報取得
   * Jambo API: get_bookmark_stream_info
   */
  bookmarkStreamInfo: async (params, ctx) => {
    const ip = getClientIpFromHeaders(ctx.headers);
    const token = getToken(params);

    const body = {
      api: JAMBO_API_ROUTE.GET_BOOKMARK_STREAM_INFO,
      ip,
      token,
    };

    return serverHttpClient.post(JAMBO_ROOT, body, {
      timeoutMs: 4000,
    });
  },
};

/**
 * タスクランナーを作成
 *
 * @param tasks タスクリクエスト配列
 * @param ctx 実行コンテキスト
 * @returns タスクランナー配列
 *
 * @example
 * const runners = createTaskRunners(
 *   [
 *     { key: 'unreadCount' },
 *     { key: 'liveUsers', params: { token: 'abc' } }
 *   ],
 *   { headers: req.headers }
 * );
 *
 * // 各タスクを並列実行
 * for (const { key, run } of runners) {
 *   run().then(data => console.log(key, data));
 * }
 */
export function createTaskRunners(
  tasks: TaskRequest[],
  ctx: TaskContext,
): TaskRunner[] {
  return tasks.map((task) => ({
    key: task.key,
    run: () => {
      const executor = TASK_EXECUTORS[task.key];
      if (!executor) {
        return Promise.reject(new Error(`Unknown task: ${task.key}`));
      }
      return executor(task.params, ctx);
    },
  }));
}
