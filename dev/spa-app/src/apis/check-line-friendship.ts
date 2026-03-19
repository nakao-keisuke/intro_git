export type CheckLineFriendshipApiResponse =
  | {
      type: 'success';
      friendFlag: boolean;
    }
  | {
      type: 'error';
      message: string;
    };

/**
 * LINE友だち状態を確認するAPIクライアント関数
 */
export const checkLineFriendship =
  async (): Promise<CheckLineFriendshipApiResponse> => {
    try {
      const response = await fetch('/api/check-line-friendship', {
        method: 'GET',
        credentials: 'include', // Cookieを含める
        cache: 'no-store', // キャッシュを無効化
      });

      if (response.status === 401) {
        return {
          type: 'error',
          message: 'LINEログインが必要です',
        };
      }

      if (response.status === 403) {
        return {
          type: 'error',
          message: 'スコープが不十分です。再度ログインしてください',
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          type: 'error',
          message: errorData.error || '友だち状態の確認に失敗しました',
        };
      }

      const data = await response.json();

      return {
        type: 'success',
        friendFlag: data.friendFlag,
      };
    } catch (error) {
      console.error('Check LINE friendship API error:', error);

      return {
        type: 'error',
        message: '通信エラーが発生しました',
      };
    }
  };

/**
 * LINEログインページにリダイレクト
 */
export const redirectToLineLogin = (
  botPrompt: 'normal' | 'aggressive' = 'normal',
  nextUrl?: string,
) => {
  const params = new URLSearchParams({
    bp: botPrompt,
  });

  if (nextUrl) {
    params.set('next', nextUrl);
  }
  const redirectUrl = `/api/authorize-line?${params.toString()}`;

  window.location.href = redirectUrl;
};
