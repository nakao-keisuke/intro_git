import { useQueryClient } from '@tanstack/react-query';
import { useTransition } from 'react';

type UseRefreshButtonOptions = {
  queryKey: string;
  onRefresh?: () => void; // カスタムリフレッシュ処理用
};

/**
 * リフレッシュボタンの共通ロジックを提供するカスタムフック
 * @param options - クエリキーとカスタムリフレッシュ処理のオプション
 * @returns handleRefresh関数とisPending状態
 */
export const useRefreshButton = ({
  queryKey,
  onRefresh,
}: UseRefreshButtonOptions) => {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      if (onRefresh) {
        // カスタムリフレッシュ処理が指定されている場合
        onRefresh();
      }

      // カスタム処理の有無に関わらず、該当クエリ群を無効化して再取得させる
      queryClient.invalidateQueries({ queryKey: [queryKey], exact: false });
    });
  };

  return { handleRefresh, isPending };
};
