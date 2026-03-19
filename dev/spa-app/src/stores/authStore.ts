/**
 * 認証ストア（Zustand）
 *
 * NextAuth sessionの代替として、SPA用の認証状態管理を提供する。
 * login/logout/autoLoginの各アクションでトークンとユーザー情報を管理する。
 */
import { create } from 'zustand';
import {
  type Session,
  type SessionStatus,
  type User,
  getStoredUser,
  getToken,
  removeToken,
  removeUser,
  saveUser,
  setToken,
  sha1Hash,
} from '@/libs/auth';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://app.stg-jambo.com:9119';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: SessionStatus;

  /** メール・パスワードでログインする */
  login: (email: string, password: string) => Promise<void>;

  /** ログアウトする */
  logout: () => void;

  /** 既存トークンで自動ログインする（アプリ起動時用） */
  autoLogin: (token?: string) => Promise<void>;

  /** セッションオブジェクトを返す（next-auth互換） */
  getSession: () => Session | null;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  status: 'loading' as SessionStatus,

  login: async (email: string, password: string) => {
    set({ status: 'loading' });

    try {
      const hashedPassword = await sha1Hash(password);

      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          pass: hashedPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Login failed with status ${response.status}`,
        );
      }

      const data = await response.json();

      const user: User = {
        id: data.id || data.userId || '',
        email: data.email || email,
        name: data.name || '',
        token: data.token,
        pass: hashedPassword,
        ip: data.ip,
        isLogout: false,
        isFirstRegister: data.isFirstRegister ?? false,
        phone: data.phone,
        googleAccountId: data.googleAccountId,
        lineId: data.lineId,
        applicationId: data.applicationId,
        scFlag: data.scFlag,
      };

      const token = data.token || '';

      // ストレージに保存
      setToken(token);
      saveUser(user);

      set({
        user,
        token,
        isAuthenticated: true,
        status: 'authenticated',
      });
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'unauthenticated',
      });
      throw error;
    }
  },

  logout: () => {
    removeToken();
    removeUser();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      status: 'unauthenticated',
    });
  },

  autoLogin: async (tokenOverride?: string) => {
    set({ status: 'loading' });

    const token = tokenOverride || getToken();
    if (!token) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'unauthenticated',
      });
      return;
    }

    // トークンをストレージに保存（外部から渡された場合）
    if (tokenOverride) {
      setToken(tokenOverride);
    }

    // ローカルに保存されたユーザー情報を復元
    const storedUser = getStoredUser();
    if (storedUser) {
      set({
        user: storedUser,
        token,
        isAuthenticated: true,
        status: 'authenticated',
      });
      return;
    }

    // ユーザー情報がない場合はAPIから取得を試みる
    try {
      const response = await fetch(`${API_URL}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        removeToken();
        removeUser();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          status: 'unauthenticated',
        });
        return;
      }

      const data = await response.json();
      const user: User = {
        id: data.id || data.userId || '',
        email: data.email || '',
        name: data.name || '',
        token,
        ip: data.ip,
        isLogout: false,
        phone: data.phone,
        googleAccountId: data.googleAccountId,
        lineId: data.lineId,
        applicationId: data.applicationId,
        scFlag: data.scFlag,
      };

      saveUser(user);
      set({
        user,
        token,
        isAuthenticated: true,
        status: 'authenticated',
      });
    } catch {
      // APIが利用できない場合はトークンだけで認証済みとする
      removeToken();
      removeUser();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'unauthenticated',
      });
    }
  },

  getSession: () => {
    const { user, isAuthenticated } = get();
    if (!isAuthenticated || !user) return null;
    return { user };
  },
}));
