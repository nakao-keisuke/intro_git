/**
 * ナビゲーションの起点種別
 */
export enum NavOriginKind {
  /** 通常のページ遷移 */
  PAGE = 'page',
  /** モーダルからの遷移 */
  MODAL = 'modal',
  /** ヘッダーからの遷移 */
  HEADER = 'header',
  /** サイドバーからの遷移 */
  SIDEBAR = 'sidebar',
  /** バナーからの遷移 */
  BANNER = 'banner',
  /** 不明な起点 */
  UNKNOWN = 'unknown',
}

/**
 * ナビゲーションの起点情報
 */
export type NavOrigin =
  | { kind: NavOriginKind.PAGE; path: string }
  | { kind: NavOriginKind.MODAL; modalId: string; inPath: string }
  | { kind: NavOriginKind.HEADER; actionId: string; inPath: string }
  | { kind: NavOriginKind.SIDEBAR; actionId: string; inPath: string }
  | { kind: NavOriginKind.BANNER; bannerId: string; inPath: string }
  | { kind: NavOriginKind.UNKNOWN };

/**
 * ナビゲーション先の情報
 */
export type NavTo = {
  /** パス名 */
  pathname: string;
  /** クエリパラメータ（?x=1&y=2） */
  search?: string;
  /** フルパス（pathname + search） */
  fullPath?: string;
};

/**
 * ナビゲーションエントリ（1回の遷移情報）
 */
export type NavEntry = {
  /** 遷移先 */
  to: NavTo;
  /** 遷移元 */
  origin: NavOrigin;
};

/**
 * ナビゲーション状態
 */
export type NavState = {
  /** 現在のURL情報 */
  current: NavTo | null;
  /** 直近の遷移情報（現在地に至った経緯） */
  lastEntry: NavEntry | null;
  /** 次の遷移に付与する情報（pending状態） */
  pending: { origin: NavOrigin; to?: NavTo } | null;
};
