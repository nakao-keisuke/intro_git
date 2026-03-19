/**
 * 最低ローディング時間を保証する非同期関数
 * @param minimumTime - 最低待機時間（ミリ秒）
 * @returns Promise<void>
 */
export const ensureMinimumLoadingTime = async (
  minimumTime: number,
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, minimumTime);
  });
};

/**
 * 実際の処理と最低ローディング時間を並行実行し、両方が完了するまで待機する
 * @param asyncFunction - 実行する非同期関数
 * @param minimumTime - 最低待機時間（ミリ秒、デフォルト: 400ms）
 * @returns Promise<T> - 非同期関数の結果
 */
export const withMinimumLoadingTime = async <T>(
  asyncFunction: () => Promise<T>,
  minimumTime = 500,
): Promise<T> => {
  const [result] = await Promise.all([
    asyncFunction(),
    ensureMinimumLoadingTime(minimumTime),
  ]);

  return result;
};
