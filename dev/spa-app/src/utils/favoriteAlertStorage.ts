/**
 * お気に入りアラート機能のlocalStorage管理
 *
 * 仕様:
 * - ユーザーごとにメッセージ送信数をカウント（0〜2）
 * - 3通目（count=2）でアラート表示
 * - 同じユーザーには2日に1回のみ表示
 * - 最大10件まで管理（古い順に削除）
 */

const STORAGE_KEY = 'favorite_alert_users';
const MAX_ENTRIES = 10;

export type FavoriteAlertEntry = {
  count: number; // 0, 1, 2 のいずれか
  lastShownDate: string | null; // YYYY-MM-DD形式、未表示の場合はnull
  updatedAt: number; // タイムスタンプ（ソート用）
};

export type FavoriteAlertStorage = {
  [userId: string]: FavoriteAlertEntry;
};

/**
 * 現在の日付を YYYY-MM-DD 形式で取得
 */
const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * localStorageからデータを取得
 */
const getStorage = (): FavoriteAlertStorage => {
  if (typeof window === 'undefined') return {};

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};
    const parsed = JSON.parse(data) as FavoriteAlertStorage;
    // データの妥当性チェック
    if (typeof parsed !== 'object' || parsed === null) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return parsed;
  } catch (error) {
    console.error('Failed to parse favorite alert storage:', error);
    localStorage.removeItem(STORAGE_KEY);
    return {};
  }
};

/**
 * localStorageにデータを保存
 */
const setStorage = (data: FavoriteAlertStorage): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      console.error('Failed to save favorite alert storage:', error);
    }
  }
};

/**
 * 2日間のクールダウン期間かどうかを判定
 *
 * @param lastShownDate - 最後にモーダルを表示した日付（YYYY-MM-DD）
 * @returns クールダウン期間中の場合はtrue
 *
 * 例: lastShownDate が "2025-01-01" の場合
 * - 2025-01-01: クールダウン中（当日）
 * - 2025-01-02: クールダウン中（翌日）
 * - 2025-01-03: クールダウン終了
 */
const isInCooldown = (lastShownDate: string | null): boolean => {
  if (!lastShownDate) return false;

  const today = getCurrentDate();
  const lastShown = new Date(lastShownDate);
  const current = new Date(today);

  // 日付の差分を計算（ミリ秒 → 日数）
  const diffTime = current.getTime() - lastShown.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 2日未満（0日目、1日目）はクールダウン中
  return diffDays < 2;
};

/**
 * 10件を超えた場合に最も古いエントリを削除
 */
const enforceMaxEntries = (
  data: FavoriteAlertStorage,
): FavoriteAlertStorage => {
  const entries = Object.entries(data);

  if (entries.length <= MAX_ENTRIES) {
    return data;
  }

  // updatedAt でソートし、最も古いものを削除
  const sorted = entries.sort((a, b) => a[1].updatedAt - b[1].updatedAt);
  const toRemove = sorted.slice(0, entries.length - MAX_ENTRIES);

  const newData = { ...data };
  toRemove.forEach(([userId]) => {
    delete newData[userId];
  });

  return newData;
};

/**
 * メッセージ送信時にカウントを増やす
 *
 * @param userId - 送信先のユーザーID
 * @returns モーダルを表示すべきかどうか
 */
export const incrementMessageCount = (userId: string): boolean => {
  let data = getStorage();
  const entry = data[userId];

  if (!entry) {
    // 初回送信: count=0 で記録
    data[userId] = {
      count: 0,
      lastShownDate: null,
      updatedAt: Date.now(),
    };
    data = enforceMaxEntries(data);
    setStorage(data);
    return false;
  }

  // クールダウン中の場合はカウントしない
  if (isInCooldown(entry.lastShownDate)) {
    return false;
  }

  // カウントを増やす
  const newCount = entry.count + 1;

  if (newCount >= 2) {
    // 3通目: モーダル表示してlastShownDateを設定
    data[userId] = {
      count: 0,
      lastShownDate: getCurrentDate(),
      updatedAt: Date.now(),
    };
    const newData = enforceMaxEntries(data);
    setStorage(newData);
    return true;
  }

  // 2通目以下: カウントを更新
  data[userId] = {
    ...entry,
    count: newCount,
    updatedAt: Date.now(),
  };
  setStorage(data);
  return false;
};

/**
 * お気に入り登録/解除時にカウントをリセット
 *
 * @param userId - ユーザーID
 */
export const resetUserCount = (userId: string): void => {
  const data = getStorage();

  if (data[userId]) {
    delete data[userId];
    setStorage(data);
  }
};
