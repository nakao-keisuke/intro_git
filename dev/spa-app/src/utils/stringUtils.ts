/**
 * 文字列操作関連のユーティリティ関数
 */

/**
 * ユーザー名をマスクする（最初の1文字のみ表示）
 * @param username - マスクするユーザー名
 * @returns マスクされたユーザー名（例: "田*****"）
 * @example
 * maskUsername('田中太郎') // => '田*****'
 * maskUsername('') // => '*****'
 * maskUsername(null) // => '*****'
 */
export const maskUsername = (username: string): string => {
  if (!username || username.length === 0) {
    return '*****';
  }
  return `${username.charAt(0)}*****`;
};
