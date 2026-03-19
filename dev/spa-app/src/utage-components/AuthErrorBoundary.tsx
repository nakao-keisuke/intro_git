// TODO: i18n - import { useTranslations } from '#/i18n';
import type React from 'react';
import { Component, type ReactNode } from 'react';
import SuspenseLoading from '@/components/common/SuspenseLoading';
import {
  isInvalidTokenError,
  redirectToReauth,
} from '@/utils/invalidTokenHandler';

/** Functional wrapper to provide translated loading message for class component */
function AuthLoadingFallback() {
  const t = useTranslations('errors');
  return <SuspenseLoading message={t('authenticating')} size="large" />;
}

interface Props {
  children: ReactNode;
  /** 認証エラー以外のエラー時に表示するフォールバック（省略時は子要素を再レンダリング） */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  isAuthError: boolean;
  error: Error | null;
}

/**
 * 認証エラー（トークン無効化）をキャッチして /reauth にリダイレクトする ErrorBoundary
 *
 * ## 動作
 * 1. 子コンポーネントでエラーが発生
 * 2. エラーが認証関連かチェック（code:3, errorCode:401, INVALID_TOKEN など）
 * 3. 認証エラーの場合 → /reauth にリダイレクト（error.tsx を表示しない）
 * 4. その他のエラー → fallback を表示、または error.tsx に委譲
 *
 * ## 使い方
 * ```tsx
 * // layout.tsx で全体をラップ
 * <AuthErrorBoundary>
 *   {children}
 * </AuthErrorBoundary>
 * ```
 */
export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      isAuthError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 共通のエラー判定ロジックを使用
    const isAuthError = isInvalidTokenError(error);

    return {
      hasError: true,
      isAuthError,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 認証エラーの場合は /reauth にリダイレクト
    if (this.state.isAuthError) {
      if (import.meta.env.NODE_ENV === 'development') {
        console.log(
          '[AuthErrorBoundary] 認証エラーを検知 - /reauth にリダイレクト',
        );
        console.log('[AuthErrorBoundary] Error:', error.message);
      }

      // ブラウザ環境でのみリダイレクト
      if (typeof window !== 'undefined') {
        // 既に /reauth にいる場合は無限ループ防止
        if (window.location.pathname === '/reauth') {
          if (import.meta.env.NODE_ENV === 'development') {
            console.log('[AuthErrorBoundary] 既に /reauth にいるためスキップ');
          }
          return;
        }

        redirectToReauth();
      }
      return;
    }

    // 認証エラー以外はログ出力のみ（error.tsx に委譲）
    console.error('[AuthErrorBoundary] Non-auth error:', error);
    console.error('[AuthErrorBoundary] Error info:', errorInfo);
  }

  override render(): ReactNode {
    const { hasError, isAuthError } = this.state;
    const { children, fallback } = this.props;

    // 認証エラーの場合はローディング表示（リダイレクト中）
    if (hasError && isAuthError) {
      return <AuthLoadingFallback />;
    }

    // その他のエラーの場合
    if (hasError) {
      // fallback が指定されていればそれを表示
      if (fallback) {
        return fallback;
      }
      // fallback がなければエラーを再スロー（error.tsx に委譲）
      throw this.state.error ?? new Error('Unknown error occurred');
    }

    return children;
  }
}

export default AuthErrorBoundary;
