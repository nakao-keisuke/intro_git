/**
 * 認証不要で公開されているパスの定義
 * middleware.api.ts と CategoryNavigation.tsx で共通利用
 */

// 認証ページのパス（ログイン・サインアップ関連）
export const authPages = [
  '/login',
  '/signup',
  '/login/pc',
  '/signup/pc',
  '/forgot-password',
  '/home',
];

// その他の公開ページ（認証不要）- 完全一致のみ許可
export const publicExactPaths = [
  '/login_for_shion_android',
  '/tos',
  '/tos/pc',
  '/commerce',
  '/privacy',
  '/privacy/pc',
  '/confirm-mail',
  '/tuto',
  '/reset-password',
];

// 公開ページ（認証不要）- 子パスも含めて許可
export const publicPrefixPaths = [
  '/girls',
  '/line', // /line/callback などを含む
  '/profile/unbroadcaster', // プロフィール公開ページ
  '/profile-debug/unbroadcaster', // App Router版
  '/timeline', // /timeline/list, /timeline/detail を含む
  '/board',
  '/ranking',
  '/gallery',
  '/column',
  '/live',
  '/lady-job',
  '/lp',
  '/faq',
  '/sitemap',
  '/approach',
  '/live-list',
  '/video-list',
  '/onboarding', // オンボーディングミッションページ
  '/fleamarket', // フリマの使い方ページ
];

export const excludeNavbarPaths = ['/', '/lp', '/faq', '/sitemap'];
