/**
 * girls/allページのデータ取得・キャッシュ関連の定数
 * メンテナンス性向上のため、マジックナンバーを集約
 */

// ============================================================
// データ取得件数
// ============================================================

/**
 * 初回探すユーザー取得件数
 */
export const MEET_PEOPLE_INITIAL_LIMIT = 20;

/**
 * フリマ出品中ユーザー取得件数
 */
export const FLEA_MARKET_USERS_LIMIT = 50;

/**
 * 今すぐビデオ通話できるユーザー取得件数
 */
export const RECENT_VIDEO_CALL_USERS_LIMIT = 20;

// ============================================================
// キャッシュ時間（秒）
// ============================================================

/**
 * ビデオ通話ランキングのキャッシュ時間（24時間）
 */
export const RANKING_CACHE_DURATION = 86400; // 24時間

/**
 * 今すぐビデオ通話できるユーザーのキャッシュ時間（2分）
 */
export const RECENT_VIDEO_CALL_USERS_CACHE_DURATION = 120; // 2分

/**
 * 今すぐ話せるユーザー（InstantCallData）のキャッシュ時間（1分）
 */
export const INSTANT_CALL_DATA_CACHE_DURATION = 60; // 1分

/**
 * 探すユーザー一覧（MeetPeople）のキャッシュ時間（2分）
 */
export const MEET_PEOPLE_CACHE_DURATION = 120; // 2分

/**
 * フリマ出品中ユーザーのキャッシュ時間（2分）
 */
export const FLEA_MARKET_USERS_CACHE_DURATION = 120; // 2分

/**
 * girls/allページ全体のrevalidate時間（1分）
 */
export const GIRLS_ALL_PAGE_REVALIDATE = 60; // 1分

// ============================================================
// React Queryキャッシュ時間（ミリ秒）
// ============================================================

/**
 * React Query staleTime（1分）
 * キャッシュを新鮮として扱う時間
 */
export const REACT_QUERY_STALE_TIME = 60 * 1000; // 60秒

/**
 * React Query gcTime（5分）
 * キャッシュをメモリに保持する時間
 */
export const REACT_QUERY_GC_TIME = 5 * 60 * 1000; // 5分

/**
 * 更新ボタンの最低ローディング表示時間（ミリ秒）
 * アニメーションを確実に表示するための待機時間
 */
export const MIN_REFRESH_LOADING_TIME = 500; // 0.5秒

// ============================================================
// フィルター設定
// ============================================================

/**
 * デフォルトの顔出しフィルター
 */
export const DEFAULT_SHOWING_FACE = true;

/**
 * デフォルトのソートタイプ（ログイン順）
 */
export const DEFAULT_SORT_TYPE = 0;

/**
 * デフォルトアバターフラグ
 */
export const DEFAULT_AVATAR_FLAG = false;

/**
 * matureフィルターの年齢下限
 */
export const MATURE_FILTER_LOWER_AGE = 35;
