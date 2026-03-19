import { getOnlineStatus } from '@/utils/onlineStatus';

interface OnlineStatusIndicatorProps {
  lastLoginTime: string;
}

/**
 * オンラインステータスインジケーター
 *
 * girls/allと同じスタイルを適用:
 * - オンライン（8時間以内）: 緑丸 + アニメーション (h-4 w-4 / h-3.5 w-3.5)
 * - 最近ログイン（24時間以内）: 黄色丸 (h-2 w-2)
 * - オフライン（24時間以上）: 表示なし
 */
export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({
  lastLoginTime,
}) => {
  const status = getOnlineStatus(lastLoginTime);

  // オンライン（8時間以内）: 緑丸 + アニメーション
  if (status.isOnline) {
    return (
      <span
        className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center"
        aria-label="オンライン中"
      >
        <span className="absolute h-4 w-4 animate-online-ping rounded-full bg-green-400" />
        <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
      </span>
    );
  }

  // 最近ログイン（24時間以内）: 黄色丸
  if (status.isRecent) {
    return (
      <span
        className="h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500"
        aria-label="最近ログイン"
      />
    );
  }

  // オフライン（24時間以上）: 何も表示しない
  return null;
};
