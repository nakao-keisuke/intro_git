import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';

// ============================================
// ブロック関連API
// ============================================

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Client
// ──────────────────────────────────────────

/**
 * ブロック追加リクエスト（Client → Route Handler）
 */
export type AddBlockRequest = {
  partner_id: string;
};

/**
 * ブロック追加レスポンス（Route Handler → Client）
 * ResponseData<T>型でラップされる
 */
export type AddBlockResponse = {
  message?: string;
};

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Jambo
// ──────────────────────────────────────────

/**
 * ブロック追加リクエスト（Route Handler → Jambo）
 */
export type AddBlockJamboRequest = {
  api: typeof JAMBO_API_ROUTE.ADD_BLOCK;
  token: string;
  req_user_id: string;
};

/**
 * ブロック追加レスポンス（Jambo → Route Handler）
 */
export type AddBlockJamboResponse = {
  code: number;
  message?: string;
};

// ──────────────────────────────────────────
// リクエスト作成関数
// ──────────────────────────────────────────

/**
 * Jambo API用のブロック追加リクエストを作成
 */
export const createAddBlockJamboRequest = (
  token: string,
  partnerId: string,
): AddBlockJamboRequest => ({
  api: JAMBO_API_ROUTE.ADD_BLOCK,
  token,
  req_user_id: partnerId,
});

// ============================================
// ブロック解除関連API
// ============================================

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Client
// ──────────────────────────────────────────

/**
 * ブロック解除リクエスト（Client → Route Handler）
 */
export type RemoveBlockRequest = {
  partner_id: string;
};

/**
 * ブロック解除レスポンス（Route Handler → Client）
 * ResponseData<T>型でラップされる
 */
export type RemoveBlockResponse = {
  message?: string;
};

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Jambo
// ──────────────────────────────────────────

/**
 * ブロック解除リクエスト（Route Handler → Jambo）
 */
export type RemoveBlockJamboRequest = {
  api: typeof JAMBO_API_ROUTE.REMOVE_BLOCK;
  token: string;
  blk_user_id: string;
};

/**
 * ブロック解除レスポンス（Jambo → Route Handler）
 */
export type RemoveBlockJamboResponse = {
  code: number;
  message?: string;
};

// ──────────────────────────────────────────
// リクエスト作成関数
// ──────────────────────────────────────────

/**
 * Jambo API用のブロック解除リクエストを作成
 */
export const createRemoveBlockJamboRequest = (
  token: string,
  partnerId: string,
): RemoveBlockJamboRequest => ({
  api: JAMBO_API_ROUTE.REMOVE_BLOCK,
  token,
  blk_user_id: partnerId,
});
