import type { TaskKey } from './types';

/**
 * ポーリング間隔グループの定義
 *
 * 調査結果に基づき、11個のAPIを間隔ごとにグループ化
 */

/**
 * 超高頻度グループ（1秒間隔）
 * - 決済完了チェック（Paidy, Amazon Pay）
 */
export const ULTRA_HIGH_FREQUENCY_TASKS: TaskKey[] = [
  'myPoint', // 決済完了チェック用
];

/**
 * 高頻度グループ（3秒間隔）
 * - メッセージ・ライブ・未読・着信監視
 */
export const HIGH_FREQUENCY_TASKS: TaskKey[] = [
  'unreadCount', // 未読数監視
  'liveUsers', // ライブ状態監視
  // 'listConversation', // メッセージ一覧自動更新（無効化中）
  'incomingCall', // 着信監視（元は2秒だが3秒に統一）
  'newChat', // 新着チャット通知（元は4秒だが3秒に統一）
];

/**
 * 中頻度グループ（5秒間隔）
 * - チャット履歴
 */
export const MEDIUM_FREQUENCY_TASKS: TaskKey[] = [
  'chatHistory', // チャット履歴自動更新
];

/**
 * 低頻度グループ（30秒間隔）
 * - ランキングデータ
 */
export const LOW_FREQUENCY_TASKS: TaskKey[] = [
  'utagePolling', // 動画・画像ランキング更新（仮定）
];

/**
 * ポーリンググループ設定
 */
export const POLLING_GROUPS = {
  ultraHighFrequency: {
    tasks: ULTRA_HIGH_FREQUENCY_TASKS,
    interval: 1000, // 1秒
    description: '決済完了チェック',
  },
  highFrequency: {
    tasks: HIGH_FREQUENCY_TASKS,
    interval: 3000, // 3秒
    description: 'メッセージ・ライブ・未読・着信',
  },
  mediumFrequency: {
    tasks: MEDIUM_FREQUENCY_TASKS,
    interval: 5000, // 5秒
    description: 'チャット履歴',
  },
  lowFrequency: {
    tasks: LOW_FREQUENCY_TASKS,
    interval: 30000, // 30秒
    description: 'ランキング',
  },
} as const;
