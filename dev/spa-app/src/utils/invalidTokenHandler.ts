import { JamboApiErrors } from '@/constants/JamboApiErrors';

/** API レスポンスの型（code / errorCode を持つ可能性があるもの） */
type ApiResponseWithCode = { code?: number; errorCode?: number };

/**
 * トークン無効化（code:3 / errorCode:401）のレスポンスかどうかを判定
 */
export const isInvalidTokenResponse = (response: unknown): boolean => {
  if (!response || typeof response !== 'object') return false;
  const res = response as ApiResponseWithCode;
  return res?.code === JamboApiErrors.INVALID_TOKEN || res?.errorCode === 401;
};

// 正規表現をプリコンパイル（パフォーマンス最適化）
const INVALID_TOKEN_PATTERN = /invalid_token/i;
const CODE_3_PATTERN = /["']?code["']?\s*:\s*3\b/;
const ERROR_CODE_401_PATTERN = /["']?errorcode["']?\s*:\s*401\b/i;

/**
 * Errorオブジェクトがトークン無効化エラーかどうかを判定
 * ErrorBoundaryなどでスローされたエラーを判定する際に使用
 *
 * @param error - 判定対象のErrorオブジェクト
 * @returns トークン無効化エラーの場合true
 */
export const isInvalidTokenError = (error: Error): boolean => {
  const text = (error.message?.toLowerCase() ?? '') + String(error);

  // 認証エラーかどうかを厳密に判定（誤検知を防ぐため単独の "401" はチェックしない）
  return (
    INVALID_TOKEN_PATTERN.test(text) ||
    CODE_3_PATTERN.test(text) ||
    ERROR_CODE_401_PATTERN.test(text)
  );
};

/**
 * /reauth へのリダイレクトURLを生成
 * 現在のパスを from パラメータとして含める
 */
export const getReauthRedirectUrl = (): string => {
  if (typeof window === 'undefined') {
    return '/reauth';
  }
  const currentPath = window.location.pathname + window.location.search;
  return `/reauth?from=${encodeURIComponent(currentPath)}`;
};

/**
 * /reauth にリダイレクトする
 * window.location.href によるフルリロードでリダイレクト
 */
export const redirectToReauth = (): void => {
  window.location.href = getReauthRedirectUrl();
};

/**
 * リダイレクト重複防止フラグ（クライアント側で使用）
 * @remarks ページ遷移によりモジュールが再読み込みされるため、
 *          新しいページでは自動的にfalseにリセットされる
 */
let isRedirecting = false;

/**
 * クライアント側でトークン無効化を検知して /reauth にリダイレクト
 * @returns true if redirecting (caller should stop processing)
 */
export const handleInvalidTokenForClient = (response: unknown): boolean => {
  if (isRedirecting) return true;
  if (typeof window === 'undefined') return false;
  if (window.location.pathname === '/reauth') return false;

  if (isInvalidTokenResponse(response)) {
    isRedirecting = true;
    redirectToReauth();
    return true;
  }
  return false;
};

/**
 * リダイレクトフラグをリセット（テスト用）
 */
export const resetRedirectingFlag = () => {
  isRedirecting = false;
};

/**
 * リダイレクト後に永遠に解決しないPromiseを返す
 * window.location.hrefによるリダイレクトでページが離脱するため、
 * 返却されるPromiseは解決されることを期待しない（後続処理を止める目的）
 *
 * @returns 永遠に解決しないPromise
 */
export const createNeverResolvingPromise = <T = never>(): Promise<T> => {
  return new Promise<T>(() => {});
};

