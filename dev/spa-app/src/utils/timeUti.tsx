import { fromZonedTime } from 'date-fns-tz';

export const convertToSentTime = (timeStamp: string): number => {
  const year = timeStamp.slice(0, 4);
  const month = timeStamp.slice(4, 6);
  const day = timeStamp.slice(6, 8);
  const hour = timeStamp.slice(8, 10);
  const minute = timeStamp.slice(10, 12);
  const date = new Date(`${year}-${month}-${day} ${hour}:${minute}`);
  return date.getTime();
};

/**
 * JST (Asia/Tokyo) の14桁タイムスタンプをUnix時刻に変換する
 * @param timeStamp - JST形式の14桁文字列 (例: "20260109080000" = 2026年1月9日 8:00 JST)
 * @returns Unix時刻 (ミリ秒)
 */
export const convertToSentTimeJST = (timeStamp: string): number => {
  // jambo-server の time_stamp は UTC 基準の14桁（秒）または17桁（ミリ秒）
  const year = parseInt(timeStamp.slice(0, 4), 10);
  const month = parseInt(timeStamp.slice(4, 6), 10) - 1; // 0-based
  const day = parseInt(timeStamp.slice(6, 8), 10);
  const hour = parseInt(timeStamp.slice(8, 10), 10);
  const minute = parseInt(timeStamp.slice(10, 12), 10);
  const second = parseInt(timeStamp.slice(12, 14) || '0', 10);
  const milli =
    timeStamp.length >= 17 ? parseInt(timeStamp.slice(14, 17), 10) : 0;

  // UTC としてエポックミリ秒に変換
  const ms = Date.UTC(year, month, day, hour, minute, second, milli);
  return ms;
};

export const checkTimeInRange = (startDateStr: string, endDateStr: string) => {
  // 現在の日時をUTCに変換
  const nowUtc = fromZonedTime(new Date(), 'Asia/Tokyo');

  // 開始日時と終了日時をUTCに変換
  const startDateUtc = fromZonedTime(new Date(startDateStr), 'Asia/Tokyo');
  const endDateUtc = fromZonedTime(new Date(endDateStr), 'Asia/Tokyo');

  // 現在の日時が指定された範囲内かどうかを判定
  return nowUtc >= startDateUtc && nowUtc <= endDateUtc;
};

/**
 * 現在の日付を日本時間で取得する
 * @returns {string} 日付
 */
export const getCurrentDateInJapan = () => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tokyo',
  };
  return new Date().toLocaleString('ja-JP', options).split('/').join('-');
};

export const formatCheckTime = (checkTime: string) => {
  const now = new Date();
  const postDate = new Date(
    parseInt(checkTime.substring(0, 4), 10),
    parseInt(checkTime.substring(4, 6), 10) - 1,
    parseInt(checkTime.substring(6, 8), 10),
    parseInt(checkTime.substring(8, 10), 10),
    parseInt(checkTime.substring(10, 12), 10),
  );

  const diff = now.getTime() - postDate.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // 当日の場合
  if (days === 0) {
    if (minutes < 60) {
      return `${minutes}分前`;
    }
    return `${hours}時間前`;
  }

  // 24時間以上前の場合
  return `${postDate.getMonth() + 1}/${postDate.getDate()}`;
};
