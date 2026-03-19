/**
 * ユーザーステータス関連のユーティリティ関数
 */

/**
 * 登録日からの初心者判定（登録から30日以内は初心者）
 * @param regDate 登録日 (YYYYMMDDHHMMSS形式)
 * @returns 30日以内ならtrue、それ以外はfalse
 */
export const isBeginnerByRegDate = (regDate?: string): boolean => {
  if (!regDate) return false;

  const year = regDate.substr(0, 4);
  const month = regDate.substr(4, 2);
  const day = regDate.substr(6, 2);
  const regDateTime = new Date(`${year}-${month}-${day}`);
  const now = new Date();
  const daysDiff = Math.floor(
    (now.getTime() - regDateTime.getTime()) / (1000 * 60 * 60 * 24),
  );

  return daysDiff <= 30; // 30日以内なら初心者
};
