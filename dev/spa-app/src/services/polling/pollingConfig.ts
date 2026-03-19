import type { TaskKey } from './types';

/**
 * 各タスクのポーリング設定
 *
 * 統合ポーリングマネージャーで使用
 */
export const TASK_POLLING_CONFIG: Record<
  TaskKey,
  {
    interval: number;
    description: string;
    enabled: boolean; // デフォルトで有効かどうか
  }
> = {
  myPoint: {
    interval: 3000,
    description: 'ポイント残高取得',
    enabled: true,
  },
  unreadCount: {
    interval: 3000,
    description: '未読数監視',
    enabled: true,
  },
  liveUsers: {
    interval: 3000,
    description: 'ライブ状態監視',
    enabled: true,
  },
  listConversation: {
    interval: 3000,
    description: 'メッセージ一覧自動更新',
    enabled: false,
  },
  incomingCall: {
    interval: 3000,
    description: '着信監視',
    enabled: true,
  },
  newChat: {
    interval: 3000,
    description: '新着チャット通知',
    enabled: false,
  },
  bookmarkStreamInfo: {
    interval: 3000,
    description: 'お気に入り配信情報取得',
    enabled: true,
  },

  // 中頻度（5秒）- チャット履歴（デフォルト無効、メッセージ詳細画面で動的に有効化）
  chatHistory: {
    interval: 5000,
    description: 'チャット履歴自動更新',
    enabled: false,
  },

  // 高頻度（3秒）- 新着チャット(Utage専用)
  utagePolling: {
    interval: 3000,
    description: '新着チャット（Utage専用）',
    enabled: true,
  },
};

/**
 * 統合ポーリングの基本間隔（ミリ秒）
 *
 * この間隔でタスクの実行判定を行う
 * 最も短いタスク間隔に合わせる（1秒）
 */
export const UNIFIED_POLLING_INTERVAL = 1000;

/**
 * Utageポーリング取得件数
 * time_stampパラメータと組み合わせて使用
 */
export const UTAGE_WEB_POLLING_TAKE = 10;
