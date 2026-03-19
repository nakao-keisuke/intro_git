import { formatMonthDay } from '@/utils/dateFormat';

export const formatTimelineDate = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    // 日本時間での現在時刻を取得
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'たった今';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`;
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    } else if (diffInDays < 7) {
      return `${diffInDays}日前`;
    } else {
      // 日本時間での表示
      return formatMonthDay(date);
    }
  } catch (_error) {
    return dateString;
  }
};
