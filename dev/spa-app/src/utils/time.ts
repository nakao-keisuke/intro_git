export const parseTimestamp = (timestamp: string): Date => {
  const year = Number(timestamp.slice(0, 4));
  const month = Number(timestamp.slice(4, 6)) - 1; // months are 0-based in JavaScript Date
  const day = Number(timestamp.slice(6, 8));
  const hour = Number(timestamp.slice(8, 10));
  const minute = Number(timestamp.slice(10, 12));
  const second = Number(timestamp.slice(12, 14));
  const parsedDate = new Date(Date.UTC(year, month, day, hour, minute, second));

  return parsedDate;
};

/**
 * 現在時刻を14桁のタイムスタンプ文字列として生成します
 * @returns YYYYMMDDHHmmss形式の文字列
 */
export const generateTimestamp = (): string => {
  const now = new Date();
  return (
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')
  );
};

export type OnlineStatus = {
  loginStatus: string;
  statusColorClass: string;
  colorType: 'green' | 'orange' | 'grey';
};

export const getOnlineStatus = (lastLoginTimestamp: string): OnlineStatus => {
  if (!lastLoginTimestamp) {
    return {
      loginStatus: '24時間以上',
      statusColorClass: 'text-[rgb(73,73,73)]',
      colorType: 'grey',
    };
  }

  try {
    const lastLogin = parseTimestamp(lastLoginTimestamp);
    const now = new Date();

    // 最終ログインからの経過時間を計算（ミリ秒単位）
    const lastLoginDiff = now.getTime() - lastLogin.getTime();

    // 経過時間を分単位・時間単位で計算
    const minutesAgo = Math.floor(lastLoginDiff / 1000 / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);

    // ステータス判定（8時間以内 = オンライン、24時間以内 = 最近、24時間以上 = オフライン）
    if (hoursAgo < 8) {
      // 1時間未満なら分単位で表示
      const loginStatus =
        hoursAgo < 1 ? `${minutesAgo}分前` : `${hoursAgo}時間前`;
      return {
        loginStatus,
        statusColorClass: 'text-[rgb(67,220,43)]',
        colorType: 'green',
      };
    } else if (hoursAgo <= 24) {
      return {
        loginStatus: `${hoursAgo}時間前`,
        statusColorClass: 'text-[rgb(255,157,0)]',
        colorType: 'orange',
      };
    } else {
      return {
        loginStatus: '24時間以上',
        statusColorClass: 'text-[rgb(73,73,73)]',
        colorType: 'grey',
      };
    }
  } catch (_error) {
    // タイムスタンプの解析に失敗した場合はグレーを返す
    return {
      loginStatus: '24時間以上',
      statusColorClass: 'text-[rgb(73,73,73)]',
      colorType: 'grey',
    };
  }
};
