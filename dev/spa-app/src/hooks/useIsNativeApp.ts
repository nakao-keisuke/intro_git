import { useSearchParams } from '@tanstack/react-router';

/**
 * Native版アプリかどうかを判定するフック
 *
 * URLパラメータ ?app=native で判定
 * Native版フォームはAPI呼び出し時に applicationId: 72 を送信する
 *
 * 使用例: /login?app=native でアクセス
 */
export const useIsNativeApp = () => {
  const searchParams = useSearchParams();
  // searchParamsが未取得の場合はisLoadingをtrueにする
  const isLoading = searchParams === null;
  const isNative = searchParams?.get('app') === 'native';

  return { isNative, isLoading };
};
