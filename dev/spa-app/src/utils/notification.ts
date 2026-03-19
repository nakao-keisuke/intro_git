/**
 * 通知関連のユーティリティ関数
 */

/**
 * バックグラウンド通知が有効かどうかをチェック
 * @returns {boolean} バックグラウンド通知が有効な場合true
 */
export const isBackgroundNotificationEnabled = (): boolean =>
  typeof Notification !== 'undefined' && Notification.permission === 'granted';
