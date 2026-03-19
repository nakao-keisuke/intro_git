import useSWR from 'swr';
import { GET_HOME_DATA } from '@/constants/endpoints';
import type { GetHomeDataResponse } from '@/pages/api/get-home-data.api';
import { postToNext } from '@/utils/next';
/**
 * ホーム画面のデータを取得するカスタムフック
 * SWRを使用してデータをキャッシュし、プロフィール画面から戻った際に
 * 再取得を防ぐ
 */

export const useHomeData = () => {
  const fetcher = async () => {
    // postToNextはtype: 'success' | 'error'の形式で返す
    const response = await postToNext<GetHomeDataResponse & { type: string }>(
      GET_HOME_DATA,
    );

    if (response.type === 'success') {
      // typeを除いたデータを返す
      const { type, ...data } = response;
      return data as GetHomeDataResponse;
    } else {
      throw new Error('データの取得に失敗しました');
    }
  };

  const { data, error, isLoading } = useSWR<GetHomeDataResponse>(
    GET_HOME_DATA, // キャッシュキー
    fetcher,
    {
      // フォーカス時の再検証を無効化（プロフィールから戻った時に再取得しない）
      revalidateOnFocus: false,
      // マウント時の再検証を条件付きで実行（キャッシュがある場合は再取得しない）
      revalidateOnMount: true,
      // 重複排除間隔を1分に設定
      dedupingInterval: 60000,
      // エラー時のリトライ回数
      errorRetryCount: 3,
      // キャッシュの有効期間を5分に設定
      refreshInterval: 5 * 60 * 1000,
    },
  );

  return {
    homeData: data || null,
    isLoading,
    error: error?.message || null,
  };
};
