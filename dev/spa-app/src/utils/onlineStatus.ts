import { parseTimestamp } from './time';

export type OnlineStatusType = 'online' | 'recent' | 'offline';

export interface OnlineStatusResult {
  type: OnlineStatusType;
  isOnline: boolean; // 8時間以内（緑丸アニメーション表示用）
  isRecent: boolean; // 24時間以内（黄色丸表示用）
}

/**
 * オンラインステータスを判定
 *
 * 判定基準:
 * - 8時間以内: オンライン（緑）
 * - 24時間以内: 最近ログイン（黄色）
 * - 24時間以上: オフライン（グレー）
 *
 * @param lastLoginTime - YYYYMMDDHHmmss形式のタイムスタンプ
 * @returns オンラインステータス情報
 */
export const getOnlineStatus = (lastLoginTime: string): OnlineStatusResult => {
  // undefined/空文字列の場合は早期リターン
  if (!lastLoginTime) {
    return {
      type: 'offline',
      isOnline: false,
      isRecent: false,
    };
  }

  const currentTime = Date.now();
  const lastOnlineTime = parseTimestamp(lastLoginTime);

  if (!lastOnlineTime) {
    return {
      type: 'offline',
      isOnline: false,
      isRecent: false,
    };
  }

  const diffTime = currentTime - lastOnlineTime.getTime();
  const EIGHT_HOURS = 8 * 60 * 60 * 1000;
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  if (diffTime <= EIGHT_HOURS) {
    return {
      type: 'online',
      isOnline: true,
      isRecent: false,
    };
  } else if (diffTime <= TWENTY_FOUR_HOURS) {
    return {
      type: 'recent',
      isOnline: false,
      isRecent: true,
    };
  } else {
    return {
      type: 'offline',
      isOnline: false,
      isRecent: false,
    };
  }
};

/**
 * Tailwind CSSクラス名を返す（girls/all互換）
 *
 * @param lastLoginTime - YYYYMMDDHHmmss形式のタイムスタンプ
 * @returns Tailwind背景色クラス名
 */
export const getOnlineStatusColor = (lastLoginTime: string): string => {
  const status = getOnlineStatus(lastLoginTime);

  if (status.isOnline) {
    return 'bg-green-500';
  } else if (status.isRecent) {
    return 'bg-yellow-500';
  } else {
    return 'bg-gray-500';
  }
};
