import { useRouter, useSearchParams } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import { useCallback, useEffect, useState } from 'react';
import {
  checkLineFriendship,
  redirectToLineLogin,
} from '@/apis/check-line-friendship';
import { completeLineMission } from '@/apis/complete-line-mission';
import { trackEvent } from '@/utils/eventTracker';

export type LineMissionStatus =
  | 'loading'
  | 'need-login'
  | 'friend'
  | 'not-friend'
  | 'error'
  | 'completed';

export type LineMissionError = {
  type:
    | 'login_failed'
    | 'friendship_check_failed'
    | 'token_expired'
    | 'network_error';
  message: string;
};

export interface UseLineMissionResult {
  status: LineMissionStatus;
  error: LineMissionError | null;
  isProcessing: boolean;
  checkFriendshipStatus: () => Promise<void>;
  loginWithPrompt: (botPrompt: 'normal' | 'aggressive') => void;
  openOfficialAccount: () => void;
  completeMission: () => Promise<void>;
  clearError: () => void;
}

/**
 * LINE友だち追加ミッション機能のカスタムフック
 */
export const useLineMission = (): UseLineMissionResult => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [status, setStatus] = useState<LineMissionStatus>('loading');
  const [error, setError] = useState<LineMissionError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldSkipInitialCheck, setShouldSkipInitialCheck] = useState(false);

  // URLパラメータからエラーを取得
  useEffect(() => {
    if (!searchParams) return;

    const urlError = searchParams.get('error');
    const success = searchParams.get('success');

    if (urlError) {
      let errorInfo: LineMissionError;

      switch (urlError) {
        case 'user_cancelled':
          errorInfo = {
            type: 'login_failed',
            message: 'LINEログインがキャンセルされました',
          };
          break;
        case 'no_code':
        case 'authorization_failed':
        case 'token_exchange_failed':
          errorInfo = {
            type: 'login_failed',
            message: 'LINEログインに失敗しました。再度お試しください',
          };
          break;
        default:
          errorInfo = {
            type: 'network_error',
            message: 'エラーが発生しました',
          };
      }

      setError(errorInfo);
      setStatus('error');

      // URLからエラーパラメータを削除
      router.replace('/mission/onboarding/add-line-friend');
    } else if (success === 'login') {
      // ログイン成功時は友だち状態をチェック
      setStatus('loading');
      setShouldSkipInitialCheck(true); // 初回チェックをスキップ

      // URLからsuccessパラメータを削除
      router.replace('/mission/onboarding/add-line-friend');

      // 少し遅延してから友だち状態をチェック（router.replaceの完了を待つ）
      // フラグをセットして、後のuseEffectで友だち状態をチェックするようにトリガー
      setTimeout(() => {
        setShouldSkipInitialCheck(false); // 初回チェック防止フラグを解除してチェック実行
      }, 200);
    }
  }, [searchParams, router]);

  /**
   * 友だち状態を確認
   */
  const checkFriendshipStatus = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setStatus('loading');

    try {
      const result = await checkLineFriendship();

      if (result.type === 'error') {
        if (result.message.includes('ログインが必要')) {
          setStatus('need-login');
        } else {
          setError({
            type: 'friendship_check_failed',
            message: result.message,
          });
          setStatus('error');
        }
      } else {
        setStatus(result.friendFlag ? 'friend' : 'not-friend');

        // トラッキング
        if (result.friendFlag) {
          trackEvent('LINE_FRIEND_STATUS_CONFIRMED');
        }
      }
    } catch (err) {
      console.error('Friendship check error:', err);
      setError({
        type: 'network_error',
        message: '通信エラーが発生しました',
      });
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  /**
   * bot_promptを指定してLINEログイン
   */
  const loginWithPrompt = useCallback((botPrompt: 'normal' | 'aggressive') => {
    trackEvent('CLICK_LINE_LOGIN_BUTTON', { bot_prompt: botPrompt });
    redirectToLineLogin(botPrompt, '/mission/onboarding/add-line-friend');
  }, []);

  /**
   * LINE公式アカウントページを開く
   */
  const openOfficialAccount = useCallback(() => {
    trackEvent('CLICK_LINE_OFFICIAL_ACCOUNT_BUTTON');
    const officialUrl = import.meta.env.VITE_LINE_OFFICIAL_ACCOUNT_URL;
    if (officialUrl) {
      window.open(officialUrl, '_blank', 'noopener');
    }
  }, []);

  /**
   * ミッションを完了としてマークする
   */
  const completeMission = useCallback(async () => {
    if (!session?.user?.token) {
      setError({
        type: 'login_failed',
        message: 'ログインが必要です',
      });
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 直前の状態に基づいて判定（無限ループ回避のため再確認はしない）
      if (status !== 'friend') {
        setError({
          type: 'friendship_check_failed',
          message: 'まずLINE公式アカウントを友だち追加してください',
        });
        setIsProcessing(false);
        return;
      }

      // ミッション完了をサーバーに送信
      const result = await completeLineMission();

      if (result.type === 'success') {
        setStatus('completed');
        trackEvent('COMPLETE_LINE_FRIEND_MISSION');
        // 即時にオンボーディングページへ遷移（push のフォールバックで location を使用）
        try {
          router.push('/onboarding');
          // 一部環境でpushが無視される場合のフォールバック
          setTimeout(() => {
            if (
              typeof window !== 'undefined' &&
              window.location.pathname !== '/onboarding'
            ) {
              window.location.assign('/onboarding');
            }
          }, 150);
        } catch (_) {
          if (typeof window !== 'undefined') {
            window.location.assign('/onboarding');
          }
        }
      } else {
        setError({
          type: 'network_error',
          message: result.message,
        });
      }
    } catch (_err) {
      setError({
        type: 'network_error',
        message: 'ミッション完了処理に失敗しました',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [session?.user?.token, isProcessing, router, status]);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 初回ロード時に友だち状態をチェック
  useEffect(() => {
    // URLパラメータからの処理を先に行うため、少し遅延
    const timer = setTimeout(() => {
      if (
        status === 'loading' &&
        !isProcessing &&
        !error &&
        !shouldSkipInitialCheck
      ) {
        checkFriendshipStatus();
      }
    }, 300); // ログイン成功時の処理より遅く実行

    return () => clearTimeout(timer);
  }, [
    status,
    isProcessing,
    error,
    shouldSkipInitialCheck,
    checkFriendshipStatus,
  ]);

  return {
    status,
    error,
    isProcessing,
    checkFriendshipStatus,
    loginWithPrompt,
    openOfficialAccount,
    completeMission,
    clearError,
  };
};
