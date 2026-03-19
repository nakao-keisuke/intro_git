/**
 * セッションフック
 *
 * next-auth/reactのuseSession()と互換性のあるインターフェースを提供する。
 * 既存コードでuseSession()を使っている箇所をそのまま移行できるようにする。
 *
 * Usage:
 *   const { data: session, status } = useSession();
 */
import { useEffect } from 'react';
import type { Session, SessionStatus } from '@/libs/auth';
import { useAuthStore } from '@/stores/authStore';

interface UseSessionReturn {
  data: Session | null;
  status: SessionStatus;
  update: () => Promise<void>;
}

export function useSession(): UseSessionReturn {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const autoLogin = useAuthStore((state) => state.autoLogin);

  // アプリ起動時に保存済みトークンで自動ログインを試行
  useEffect(() => {
    if (status === 'loading') {
      autoLogin();
    }
  }, []);

  const session: Session | null =
    isAuthenticated && user ? { user } : null;

  const update = async () => {
    await autoLogin();
  };

  return {
    data: session,
    status,
    update,
  };
}
