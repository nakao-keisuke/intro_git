/**
 * SPA認証ユーティリティ
 *
 * NextAuthの代替として、localStorage/cookieベースのトークン管理を提供する。
 * セッション型は既存のnext-auth.d.tsと互換性を保つ。
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ========================================
// 型定義（next-auth.d.ts互換）
// ========================================

export interface User {
  id: string;
  email: string;
  name: string;
  pass?: string;
  token?: string;
  ip?: string;
  isLogout?: boolean;
  isFirstRegister?: boolean;
  phone?: string;
  googleAccountId?: string;
  lineId?: string;
  applicationId?: string;
  scFlag?: boolean;
}

export interface Session {
  user: User;
}

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

// ========================================
// トークン管理
// ========================================

/**
 * 認証トークンを取得する
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 認証トークンを保存する
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  // cookieにも保存（HTTPリクエストで自動送信されるように）
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

/**
 * 認証トークンを削除する
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

/**
 * 認証済みかどうかを判定する
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// ========================================
// ユーザー情報管理
// ========================================

/**
 * ユーザー情報をlocalStorageに保存する
 */
export function saveUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * ユーザー情報をlocalStorageから取得する
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/**
 * ユーザー情報をlocalStorageから削除する
 */
export function removeUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

/**
 * セッション情報を構築する
 */
export function getSession(): Session | null {
  const user = getStoredUser();
  if (!user || !getToken()) return null;
  return { user };
}

// ========================================
// SHA1ハッシュ（ブラウザ用）
// ========================================

/**
 * パスワードをSHA1でハッシュ化する（Web Crypto API使用）
 */
export async function sha1Hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-1', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
