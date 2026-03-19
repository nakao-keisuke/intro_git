import { useNavigate } from '@tanstack/react-router';
import { getSession, signOut, useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { clearWebSession } from '@/app/[locale]/(auth)/login/utils/nativeLoginHelpers';
import {
  getApplicationId,
  isNativeApplication,
} from '@/constants/applicationId';
import { native } from '@/libs/nativeBridge';
import { conditionalBack } from '@/utils/backButtonUtil';
import { sendMessageToWebView } from '@/utils/webview';

type UseNativeErrorFallbackOptions = {
  fallbackPath?: string;
  onBackSuccess?: () => void;
  autoRecovery?: boolean; // エラーバウンダリ用: 自動復帰を試行するか
};

/**
 * Nativeアプリ向けのエラーフォールバック処理を共通化するフック
 * - 戻るボタンの処理を統一
 * - エラーバウンダリ用の自動復帰処理
 * - Nativeアプリ時は autoLogin を試行し、失敗したら /signup?app=native へ
 */
export const useNativeErrorFallback = ({
  fallbackPath = '/girls/all',
  onBackSuccess,
  autoRecovery = false,
}: UseNativeErrorFallbackOptions = {}) => {
  const router = useRouter();
  const { update, status } = useSession();
  const hasAttemptedAutoRecovery = useRef(false);
  const isNative = isNativeApplication();

  /**
   * 戻るボタンの処理
   * - Nativeアプリ: 常に/girls/allへフルリロード
   * - Webアプリ: セッション状態に応じて処理
   */
  const handleBack = async () => {
    if (status === 'loading') return;

    // Nativeアプリの場合は常に/girls/allへ遷移（ログイン画面を表示しない）
    if (isNative) {
      // NOTE: Nativeアプリ（WebView）ではNext.jsのrouter.replaceだとRecoilやReact Queryの
      // クライアントステートがリセットされず、古いセッション情報が残る問題がある。
      // window.location.hrefによるフルリロードでステートを完全にリセットする。
      window.location.href = fallbackPath;
      return;
    }

    // Webアプリの処理
    if (status === 'authenticated') {
      const result = await update({ type: 'oneTapLogin' });
      // oneTapLoginの成功判定: isLogoutフラグを確認
      // NOTE: NextAuthのupdate()はログイン失敗時もsessionオブジェクトを返す（nullにならない）。
      // 失敗時はJWTコールバックでtoken.isLogout=trueが設定され、session.user.isLogoutに反映される。
      if (result?.user && !result.user.isLogout) {
        // セッション復帰成功
        if (onBackSuccess) {
          onBackSuccess();
        } else {
          // デフォルト: 履歴スタックがない場合、アプリを閉じる代わりにホームに遷移
          conditionalBack(router, '/');
        }
      } else {
        // oneTapLogin失敗: JWT cookieをクリアしてからログインページへ遷移
        // NOTE: signOutでcookieを消さないと、middlewareが「認証済み」と判断して
        // /login → /girls/all にリダイレクトし、再度エラーの無限ループになる
        await signOut({ redirect: false }).catch(() => {});
        window.location.href = '/login';
      }
    } else if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  };

  // エラーバウンダリ用: 自動復帰処理
  useEffect(() => {
    if (
      !autoRecovery ||
      !isNative ||
      status === 'loading' ||
      hasAttemptedAutoRecovery.current
    ) {
      return;
    }

    const attemptAutoRecovery = async () => {
      hasAttemptedAutoRecovery.current = true;

      // セッションが存在しない場合は新規登録画面へ
      if (status !== 'authenticated') {
        window.location.href = '/signup?app=native';
        return;
      }

      try {
        const { lang, idfv } = await native.getDeviceLangAndIdfv();
        const result = await update({
          type: 'autoLogin',
          applicationId: getApplicationId(),
          lang,
          ...(idfv ? { idfv } : {}),
        });

        // autoLoginの成功判定: isLogoutフラグを確認
        // NOTE: update()はログイン失敗時もsessionオブジェクトを返す（nullにならない）。
        // 失敗時はJWTコールバックでtoken.isLogout=trueが設定される。
        if (result?.user && !result.user.isLogout) {
          // セッション復帰成功 - NativeのSecureStorageを更新
          const session = await getSession();
          if (session?.user) {
            sendMessageToWebView({
              type: 'REGISTER_SUCCESS',
              payload: {
                email: session.user.email,
                pwd: session.user.pass,
                userId: session.user.id,
                token: session.user.token,
              },
            });
          }
          window.location.href = fallbackPath;
          return;
        }
      } catch {
        // autoLogin失敗
      }

      // 失敗したらWeb側のストレージをクリアしてから新規登録画面へ
      clearWebSession();
      window.location.href = '/signup?app=native';
    };

    attemptAutoRecovery();
  }, [autoRecovery, isNative, status, update, fallbackPath]);

  return {
    isNative,
    handleBack,
  };
};
