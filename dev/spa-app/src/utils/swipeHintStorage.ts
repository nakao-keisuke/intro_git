/**
 * スワイプヒント表示状態を管理するユーティリティ
 */

const SWIPE_HINT_KEY = 'swipe_hint_shown_users';

// メモリキャッシュで表示済みユーザーを管理（パフォーマンス最適化）
let shownUsersCache: Set<string> | null = null;
let cacheInitialized = false;

/**
 * キャッシュを初期化
 */
const initializeCache = (): void => {
  if (cacheInitialized || typeof window === 'undefined') return;

  try {
    const shownUsers = localStorage.getItem(SWIPE_HINT_KEY);
    if (shownUsers) {
      const userList: string[] = JSON.parse(shownUsers);
      shownUsersCache = new Set(userList);
    } else {
      shownUsersCache = new Set();
    }
    cacheInitialized = true;
  } catch (error) {
    console.error('スワイプヒント履歴キャッシュの初期化に失敗:', error);
    shownUsersCache = new Set();
    cacheInitialized = true;
  }
};

/**
 * 指定されたユーザーIDでスワイプヒントが既に表示されたかチェック
 * @param userId ユーザーID
 * @returns true: 既に表示済み, false: 未表示
 */
export const hasSwipeHintShown = (userId: string): boolean => {
  if (typeof window === 'undefined') return true; // SSR対応

  initializeCache();
  return shownUsersCache?.has(userId) ?? true;
};

/**
 * 指定されたユーザーIDでスワイプヒントを表示済みとしてマーク
 * @param userId ユーザーID
 */
export const markSwipeHintShown = (userId: string): void => {
  if (typeof window === 'undefined') return; // SSR対応

  initializeCache();

  // キャッシュに既に存在する場合は早期リターン
  if (shownUsersCache?.has(userId)) return;

  try {
    // メモリキャッシュとLocalStorageの両方を更新
    shownUsersCache?.add(userId);

    const userList = Array.from(shownUsersCache || []);
    localStorage.setItem(SWIPE_HINT_KEY, JSON.stringify(userList));
  } catch (error) {
    console.error('スワイプヒント履歴の保存に失敗:', error);
  }
};

/**
 * スワイプヒント履歴をリセット（テスト用）
 */
export const resetSwipeHintHistory = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // キャッシュとLocalStorageの両方をクリア
    shownUsersCache?.clear();
    localStorage.removeItem(SWIPE_HINT_KEY);
  } catch (error) {
    console.error('スワイプヒント履歴のリセットに失敗:', error);
  }
};
