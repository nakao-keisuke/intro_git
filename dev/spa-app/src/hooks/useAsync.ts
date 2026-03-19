import { useCallback, useState } from 'react';

export function useAsync<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  minimumLoadingTime: number = 0,
) {
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args: Args): Promise<T> => {
      setLoading(true);

      // fn() の実行と minimumLoadingTime の両方を並行で待機
      const [result] = await Promise.all([
        fn(...args),
        new Promise((resolve) => setTimeout(resolve, minimumLoadingTime)),
      ]);

      setLoading(false);
      return result;
    },
    [fn, minimumLoadingTime],
  );

  return { loading, run };
}
