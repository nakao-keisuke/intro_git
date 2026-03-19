/**
 * フリーマーケット商品のお気に入り状態をローカルストレージで管理するユーティリティ
 *
 * このユーティリティは以下の機能を提供します：
 * - お気に入り状態の保存・取得・削除
 * - 複数商品のお気に入り状態の一括復元
 * - 統一されたキー形式でのデータ管理
 */

/**
 * お気に入りストレージのキーを生成
 *
 * @param userId - ユーザーID
 * @param itemId - 商品ID
 * @returns ローカルストレージキー
 */
export const getFavoriteStorageKey = (
  userId: string,
  itemId: string,
): string => {
  return `favorite_${userId}_${itemId}`;
};

/**
 * お気に入り状態をローカルストレージに保存
 *
 * @param userId - ユーザーID
 * @param itemId - 商品ID
 * @param isFavorited - お気に入り状態（true: お気に入り、false: 削除）
 */
export const saveFavoriteToLocal = (
  userId: string,
  itemId: string,
  isFavorited: boolean,
): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const key = getFavoriteStorageKey(userId, itemId);

  if (isFavorited) {
    localStorage.setItem(key, 'true');
  } else {
    localStorage.removeItem(key);
  }
};

/**
 * ローカルストレージからお気に入り状態を取得
 *
 * @param userId - ユーザーID
 * @param itemId - 商品ID
 * @returns お気に入り状態（true: お気に入り、false: 未お気に入り）
 */
export const getFavoriteFromLocal = (
  userId: string,
  itemId: string,
): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  const key = getFavoriteStorageKey(userId, itemId);
  return localStorage.getItem(key) === 'true';
};

/**
 * 複数商品のお気に入り状態をローカルストレージから復元
 *
 * @param userId - ユーザーID
 * @param itemIds - 商品IDリスト
 * @returns お気に入りされている商品IDのSet
 */
export const restoreFavoritesFromLocal = (
  userId: string,
  itemIds: string[],
): Set<string> => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return new Set<string>();
  }

  const favoriteIds = new Set<string>();

  itemIds.forEach((itemId) => {
    if (getFavoriteFromLocal(userId, itemId)) {
      favoriteIds.add(itemId);
    }
  });

  return favoriteIds;
};

/**
 * お気に入りIDリストをローカルストレージに同期（一括更新）
 *
 * @param userId - ユーザーID
 * @param favoriteItemIds - お気に入り商品IDのSet
 */
export const syncFavoritesToLocal = (
  userId: string,
  favoriteItemIds: Set<string>,
): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  favoriteItemIds.forEach((itemId) => {
    const key = getFavoriteStorageKey(userId, itemId);
    localStorage.setItem(key, 'true');
  });
};

/**
 * 特定ユーザーのお気に入りデータをローカルストレージから削除
 *
 * @param userId - ユーザーID
 */
export const clearUserFavoritesFromLocal = (userId: string): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const keysToRemove: string[] = [];
  const prefix = `favorite_${userId}_`;

  // ローカルストレージから該当するキーを検索
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }

  // 見つかったキーを削除
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
};
