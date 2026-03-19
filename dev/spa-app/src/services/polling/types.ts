import type { UseQueryOptions } from '@tanstack/react-query';
import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type {
  Broadcaster as SharedBroadcaster,
  ChannelInfo as SharedChannelInfo,
} from '@/services/shared/type';
import type { Region } from '@/utils/region';

/**
 * タスクキー定義
 *
 * 各タスクキーとJambo APIエンドポイントのマッピング定義
 * 将来的にタイムアウト値などのメタデータも追加可能
 */
export const TASK_KEY_DEFINITIONS = {
  unreadCount: {
    api: JAMBO_API_ROUTE.TOTAL_UNREAD,
    description: '未読数取得',
  },
  liveUsers: {
    api: JAMBO_API_ROUTE.LIVE_USERS,
    description: 'ライブユーザー一覧取得',
  },
  chatHistory: {
    api: JAMBO_API_ROUTE.GET_CHAT_HISTORY,
    description: 'チャット履歴取得',
  },
  incomingCall: {
    api: JAMBO_API_ROUTE.GET_WEB_INCOMING_CALL,
    description: '着信情報取得',
  },
  listConversation: {
    api: JAMBO_API_ROUTE.LIST_CONVERSATION,
    description: '会話一覧取得',
  },
  myPoint: {
    api: JAMBO_API_ROUTE.GET_SPECIFIED_USER_POINT,
    description: '所持ポイント取得',
  },
  utagePolling: {
    api: JAMBO_API_ROUTE.UTAGE_WEB_POLLING,
    description: 'Utage専用ポーリング',
  },
  newChat: {
    api: JAMBO_API_ROUTE.GET_NEW_CHAT,
    description: '新着チャット取得',
  },
  bookmarkStreamInfo: {
    api: JAMBO_API_ROUTE.GET_BOOKMARK_STREAM_INFO,
    description: 'お気に入りユーザーの配信情報取得',
  },
} as const;

/**
 * タスクキー一覧（配列形式）
 *
 * TASK_KEY_DEFINITIONSから自動生成される
 * バリデーション等で使用
 */
export const TASK_KEYS = Object.keys(TASK_KEY_DEFINITIONS) as Array<
  keyof typeof TASK_KEY_DEFINITIONS
>;

/**
 * タスクキー型
 *
 * TASK_KEY_DEFINITIONSから派生した型
 */
export type TaskKey = keyof typeof TASK_KEY_DEFINITIONS;

/**
 * クライアントからのタスクリクエスト
 */
export type TaskRequest = {
  /** タスクキー */
  key: TaskKey;
  /** タスク固有のパラメータ（オプション） */
  params?: Record<string, unknown>;
};

/**
 * NDJSONデータ行（成功）
 */
export type NdjsonSuccessLine = {
  /** タスクキー */
  key: TaskKey;
  /** 成功フラグ */
  ok: true;
  /** レスポンスデータ */
  data: unknown;
};

/**
 * NDJSONデータ行（失敗）
 */
export type NdjsonErrorLine = {
  /** タスクキー */
  key: TaskKey;
  /** 失敗フラグ */
  ok: false;
  /** エラーメッセージ */
  error: string;
};

/**
 * NDJSONデータ行（成功 or 失敗）
 */
export type NdjsonDataLine = NdjsonSuccessLine | NdjsonErrorLine;

/**
 * NDJSON終了行
 */
export type NdjsonEndLine = {
  /** 終了タイプ */
  type: 'end';
  /** 完了したタスク数 */
  finished: number;
};

/**
 * NDJSON行（全種類）
 */
export type NdjsonLine = NdjsonDataLine | NdjsonEndLine;

/**
 * タスク実行コンテキスト
 * Route Handlerから渡されるリクエスト情報
 */
export type TaskContext = {
  /** リクエストヘッダー（IP抽出、認証などに使用） */
  headers: Headers;
};

/**
 * タスク実行関数の型
 *
 * @param params タスク固有のパラメータ
 * @param ctx 実行コンテキスト
 * @returns Jambo APIのレスポンス
 */
export type TaskExecutor = (
  params: Record<string, unknown> | undefined,
  ctx: TaskContext,
) => Promise<unknown>;

/**
 * タスクランナー
 * 実行可能な状態にラップされたタスク
 */
export type TaskRunner = {
  /** タスクキー */
  key: TaskKey;
  /** 実行関数 */
  run: () => Promise<unknown>;
};

/**
 * ポーリング結果の型（タスクキー→結果）
 */
export type PollingResult = {
  [K in TaskKey]?: {
    data?: unknown;
    error?: string;
  };
};

/**
 * Recoil に格納する各タスクの結果型
 */
export type TaskResult<T = unknown> = {
  data?: T;
  error?: string;
  updatedAt: number; // タイムスタンプ
};

/**
 * usePolling フックのオプション型
 */
export type UsePollingOptions = {
  tasks: TaskRequest[];
  refetchInterval?: number;
  refetchIntervalInBackground?: boolean;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<PollingResult>,
    'queryKey' | 'queryFn' | 'refetchInterval'
  >;
};

/**
 * Utageポーリング: APIレスポンス内の個々のアイテム型（正規化前）
 */
export type UtagePollingItem = {
  frdId: string;
  frdName: string;
  avaId: string;
  sentTime: string;
  lastMsg: string;
  msgType: string;
  isOwn: boolean;
  gender?: number;
  unreadNum?: number;
  isOnline?: boolean;
  voiceCallWaiting?: boolean;
  videoCallWaiting?: boolean;
  isNewUser?: boolean;
};

/**
 * listConversation 正規化前の生データ型
 */
export type RawConversationItem = {
  frdId?: string;
  frdName?: string;
  age?: number;
  region?: number | string;
  isOnline?: boolean;
  lastMsg?: string;
  isOwn?: boolean;
  sentTime?: string;
  timeStamp?: string;
  unreadNum?: number;
  avaId?: string;
  gender?: 0 | 1 | 2;
  msgType?: string;
  voiceCallWaiting?: boolean;
  videoCallWaiting?: boolean;
  oneBeforeMsgType?: string;
  isNewUser?: boolean;
  hasLovense?: boolean;
  isListedOnFleaMarket?: boolean;
};

/**
 * ポーリンググループキー（定義の重複を避けるためリテラルで定義）
 */
export type PollingGroupKey =
  | 'ultraHighFrequency'
  | 'highFrequency'
  | 'mediumFrequency'
  | 'lowFrequency';

export type Broadcaster = {
  gender: number;
  lastLoginTime: string;
  userName: string;
  bustSize: string;
  buzzLiveRecordingId?: string; // 過去配信の録画ID
  hasStoryMovie: boolean;
  isLiveNow: boolean;
  housemate: string;
  oftenVisitTime: string;
  defaultAvatarFlag: boolean;
  isCalling: boolean;
  looks: string;
  holidays: string;
  bloodType: string;
  isListedOnFleaMarket: boolean;
  liveTitle: string;
  liveSchedule: string;
  voiceCallWaiting: boolean;
  avaId: string;
  videoChatWaiting: boolean;
  alcohol: string;
  stepToCall: number;
  hometown: string;
  marriageHistory: number;
  inters: number[];
  talkTheme: number;
  isFav: number;
  showingFaceStatus: number;
  hasLovense: boolean;
  hLevel: string;
  applicationId: string;
  bookmark: boolean;
  abt: string;
  userId: string;
  waitingMessage: string;
  isNewUser: boolean;
  region: Region; // APIからはnumberで渡されるが、Service層で変換後の型を想定
  bdyTpe: string[];
  personalities: number[];
  age: number;
};

export type ChannelInfo = {
  standbyPointIneligibilityReason: null | string;
  availableStandbyPoint: null | number;
  talkTheme: string;
  title: string;
  userCount: null | number;
  customThumbnailId: null | string;
  thumbnailImageId: null | string;
  rtcChannelToken: string;
  channelType: string;
  channelId: string;
  appId: string;
  callType: string;
  rtmChannelToken: string;
  recordingId?: string; // 現在配信中の録画ID（IN_LIVEチャンネルのみ）
};

/**
 * お気に入りユーザーの配信情報レスポンス
 * Jambo API: get_bookmark_stream_info
 */
export type BookmarkStreamInfoResponse = {
  availableStandbyPoint: null | number;
  standPointIneligibilityReason: null | string;
  broadcaster: Broadcaster | null;
  channelInfo: ChannelInfo | null;
};

/**
 * QuickJoinHandler 用に加工済みの配信情報
 * - broadcaster / channelInfo は services/shared/type の型
 */
export type QuickJoinBookmarkStreamInfo = {
  broadcaster: SharedBroadcaster;
  channelInfo: SharedChannelInfo;
};
