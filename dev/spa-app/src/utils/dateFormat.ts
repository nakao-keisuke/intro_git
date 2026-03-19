/**
 * 日本時間での日付フォーマット用ユーティリティ
 */

// 共通の日本時間フォーマットオプション
export const JAPAN_TIMEZONE_OPTIONS = {
  timeZone: 'Asia/Tokyo',
  locale: 'ja-JP',
} as const;

// よく使われるフォーマットオプション
export const DATE_FORMAT_OPTIONS = {
  // 完全な日時: YYYY/MM/DD HH:mm
  fullDateTime: {
    ...JAPAN_TIMEZONE_OPTIONS,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  } as const,

  // 日付のみ: YYYY/MM/DD
  dateOnly: {
    ...JAPAN_TIMEZONE_OPTIONS,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  } as const,

  // 時刻のみ: HH:mm
  timeOnly: {
    ...JAPAN_TIMEZONE_OPTIONS,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  } as const,

  // チャット用: MM/DD HH:mm
  chatFormat: {
    ...JAPAN_TIMEZONE_OPTIONS,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  } as const,

  // 月日のみ: M/D
  monthDay: {
    ...JAPAN_TIMEZONE_OPTIONS,
    month: 'numeric',
    day: 'numeric',
  } as const,
} as const;

/**
 * 日本時間での完全な日時フォーマット（YYYY/MM/DD HH:mm）
 */
export const formatFullDateTime = (date: Date | string | number): string => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleString(
    JAPAN_TIMEZONE_OPTIONS.locale,
    DATE_FORMAT_OPTIONS.fullDateTime,
  );
};

/**
 * 日本時間での日付のみフォーマット（YYYY/MM/DD）
 */
export const formatDateOnly = (date: Date | string | number): string => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleString(
    JAPAN_TIMEZONE_OPTIONS.locale,
    DATE_FORMAT_OPTIONS.dateOnly,
  );
};

/**
 * 日本時間での時刻のみフォーマット（HH:mm）
 */
export const formatTimeOnly = (date: Date | string | number): string => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleString(
    JAPAN_TIMEZONE_OPTIONS.locale,
    DATE_FORMAT_OPTIONS.timeOnly,
  );
};

/**
 * チャット用日時フォーマット（MM/DD HH:mm）
 */
export const formatChatDateTime = (date: Date | string | number): string => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleString(
    JAPAN_TIMEZONE_OPTIONS.locale,
    DATE_FORMAT_OPTIONS.chatFormat,
  );
};

/**
 * 月日のみフォーマット（M/D）
 */
export const formatMonthDay = (date: Date | string | number): string => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleString(
    JAPAN_TIMEZONE_OPTIONS.locale,
    DATE_FORMAT_OPTIONS.monthDay,
  );
};

/**
 * 日付文字列をYYYY-MM-DD形式に変換
 */
export const formatDateToDashFormat = (
  date: Date | string | number,
): string => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return '';

  return dateObj
    .toLocaleString(JAPAN_TIMEZONE_OPTIONS.locale, DATE_FORMAT_OPTIONS.dateOnly)
    .split('/')
    .join('-');
};

/**
 * 日付をYYYY/MM/DD形式にフォーマット（シンプルバージョン）
 * タイムゾーン考慮なし、単純な文字列連結
 * @param input - Date, タイムスタンプ（ミリ秒）、または日付文字列
 * @returns YYYY/MM/DD形式の文字列
 */
export const formatDateYMD = (input: string | number | Date): string => {
  const date = new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};
