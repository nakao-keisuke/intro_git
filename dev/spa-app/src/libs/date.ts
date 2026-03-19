import { differenceInDays, format, isSameDay, subMinutes } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

export function getCurrentTime(timeFormat: 'yyyyMMddHHmmss'): string {
  return format(new Date(), timeFormat, { locale: ja });
}

export function getPastTime(
  minutesAgo: number,
  timeFormat: 'yyyyMMddHHmmss',
  timeZone?: string,
): string {
  const now = new Date();
  const targetDate = timeZone ? toZonedTime(now, timeZone) : now;
  const pastDate = subMinutes(targetDate, minutesAgo);
  return format(pastDate, timeFormat, { locale: ja });
}

export const formatTimelineDate = (postTime: string): string => {
  if (!postTime || postTime.length < 14) {
    console.error('Invalid post_time format:', postTime);
    return '不明な日付';
  }

  try {
    const year = parseInt(postTime.substring(0, 4), 10);
    const month = parseInt(postTime.substring(4, 6), 10) - 1;
    const day = parseInt(postTime.substring(6, 8), 10);
    const hour = parseInt(postTime.substring(8, 10), 10);
    const minute = parseInt(postTime.substring(10, 12), 10);
    const second = parseInt(postTime.substring(12, 14), 10);

    // 日本時間のDateオブジェクトを作成
    const postDate = new Date(Date.UTC(year, month, day, hour, minute, second));
    const now = new Date();
    const diffTime = now.getTime() - postDate.getTime();

    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    // date-fnsのdifferenceInDaysを使用して日数の差を計算
    const diffDays = differenceInDays(now, postDate);

    // 1分未満
    if (diffMinutes < 1) {
      return 'たった今';
    }

    // 同じ日かどうかをチェック
    if (isSameDay(now, postDate)) {
      if (diffHours < 1) {
        return `${diffMinutes}分前`;
      } else {
        return `${diffHours}時間前`;
      }
    } else if (diffDays === 0) {
      // 1日経過していないが日付が変わっている場合（例：23:59→0:01）
      return `${diffHours}時間前`;
    } else if (diffDays < 7) {
      return `${diffDays}日前`;
    } else {
      // 1週間以上前の場合は日付を表示
      return format(postDate, 'M月d日', { locale: ja });
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    return '不明な日付';
  }
};
