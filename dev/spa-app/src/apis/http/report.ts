import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';

// ============================================
// 通報関連API
// ============================================

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Client
// ──────────────────────────────────────────

/**
 * 通報追加リクエスト（Client → Route Handler）
 */
export type AddReportRequest = {
  partner_id: string;
};

/**
 * 通報追加レスポンス（Route Handler → Client）
 * ResponseData<T>型でラップされる
 */
export type AddReportResponse = {
  message?: string;
};

// ──────────────────────────────────────────
// 型定義: Route Handler ⇔ Jambo
// ──────────────────────────────────────────

/**
 * 通報追加リクエスト（Route Handler → Jambo）
 */
export type AddReportJamboRequest = {
  api: typeof JAMBO_API_ROUTE.ADD_REPORT;
  token: string;
  rpt_type: number;
  subject_type: number;
  subject_id: string;
};

/**
 * 通報追加レスポンス（Jambo → Route Handler）
 */
export type AddReportJamboResponse = {
  code: number;
  message?: string;
};

// ──────────────────────────────────────────
// リクエスト作成関数
// ──────────────────────────────────────────

/**
 * Jambo API用の通報追加リクエストを作成
 * @param sessionToken - セッショントークン
 * @param userId - 通報するユーザーID
 * @param partnerId - 通報対象のパートナーID
 */
export const createAddReportJamboRequest = (
  token: string,
  partnerId: string,
): AddReportJamboRequest => ({
  api: JAMBO_API_ROUTE.ADD_REPORT,
  token,
  rpt_type: 1, // 通報タイプ（固定値）
  subject_type: 2, // サブジェクトタイプ（ユーザー通報 = 2）
  subject_id: partnerId,
});
