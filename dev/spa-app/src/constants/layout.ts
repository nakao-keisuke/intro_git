/**
 * レイアウト関連の定数定義
 * ヘッダー、サイドバー、コンテンツエリアの位置・サイズ調整に使用
 */

// ヘッダー高さ（モバイル/PC）
export const HEADER_HEIGHT = {
  mobile: 50, // px
  desktop: 90, // px
} as const;

// サイドバー幅（PC）
export const SIDEBAR_WIDTH = 256; // px（16rem = 256px）

// Tailwind CSSクラス
export const LAYOUT_CLASSES = {
  // ヘッダーからのオフセット（top位置）
  headerOffset: {
    mobile: 'top-[50px]',
    desktop: 'md:top-[90px]',
    desktopOnly: 'top-[90px]', // mdプレフィックスなし（PC専用コンポーネント向け）
    combined: 'top-[50px] md:top-[90px]',
  },
  // サイドバーからのオフセット（left位置）
  sidebarOffset: {
    desktop: 'md:left-64',
    desktopOnly: 'left-64', // mdプレフィックスなし（PC専用コンポーネント向け）
  },
  // コンテンツエリアのパディング
  contentPadding: {
    mobile: 'pt-[50px]',
    desktop: 'md:pt-[100px]',
    combined: 'pt-[50px] md:pt-[100px]',
  },
  // コンテンツエリアのマージン
  contentMargin: {
    desktop: 'md:ml-64',
  },
} as const;

// 旧BoardHeaderで使用されていたtop-[49px]の定数（互換性維持用）
export const LEGACY_HEADER_OFFSET = {
  mobile: 'top-[49px]',
  desktop: 'md:top-[90px]',
} as const;

/**
 * 自然なスクロールアウトヘッダーを使用するページ
 * MainLayoutでインラインヘッダーとして表示され、ProvidersViewでグローバルヘッダーを非表示にする
 */
export const INLINE_HEADER_PAGES = [
  '/girls/all',
  '/board',
  '/conversation',
  '/fleamarket',
  '/my-page',
] as const;
