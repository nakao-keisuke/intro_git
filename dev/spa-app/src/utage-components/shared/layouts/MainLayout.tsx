import dynamic from 'next/dynamic';
import { useLocation } from '@tanstack/react-router';
import { Suspense } from 'react';
import CategoryNavigation from '@/components/CategoryNavigation';
import { INLINE_HEADER_PAGES, LAYOUT_CLASSES } from '@/constants/layout';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';
import { useUIStore } from '@/stores/uiStore';

// Recoilフックを使用するコンポーネントを動的インポートしてSSRを無効化
const PCSidebar = dynamic(() => import('@/components/PCSidebar'), {
  ssr: false,
});

const BottomNavigation = dynamic(
  () => import('@/app/[locale]/(tab-layout)/components/BottomNavigation'),
  {
    ssr: false,
  },
);

const SearchUserModalWrapper = dynamic(
  () =>
    import(
      '@/app/[locale]/(tab-layout)/components/SearchUserModalWrapper'
    ).then((mod) => ({ default: mod.SearchUserModalWrapper })),
  {
    ssr: false,
  },
);

const HeaderNavigation = dynamic(
  () => import('@/app/components/HeaderNavigation'),
  {
    ssr: false,
    loading: () => null,
  },
);

type MainLayoutProps = {
  children: React.ReactNode;
};

/**
 * メインレイアウト
 * (tab-layout) グループで使用され、ProvidersView の HeaderNavigation が
 * グローバルヘッダーとして機能するため、ここでは含まない
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isEmbedded = useIsEmbedded();
  const isPC = useUIStore((s) => s.isPC);

  // インラインヘッダーを使用するページかどうか
  const useInlineHeader = INLINE_HEADER_PAGES.some((page) =>
    pathname?.startsWith(page),
  );

  // bookmark-listページではヘッダー分のpadding-topを削除
  const isBookmarkList = pathname === '/bookmark-list';
  // モバイルでインラインヘッダーページの場合はpadding-top不要（ヘッダーがドキュメントフローに含まれる）
  const needsHeaderPadding =
    !isEmbedded && !isBookmarkList && !(!isPC && useInlineHeader);
  const paddingClasses = needsHeaderPadding
    ? LAYOUT_CLASSES.contentPadding.combined
    : isPC
      ? LAYOUT_CLASSES.contentPadding.desktop
      : '';
  const marginClasses = isEmbedded ? '' : LAYOUT_CLASSES.contentMargin.desktop;

  return (
    <>
      {/* iframe内またはモバイルではPCSidebarを非表示 */}
      {!isEmbedded && isPC && <PCSidebar />}

      {/* PC用カテゴリーナビゲーション - iframe内では非表示 */}
      {!isEmbedded && isPC && <CategoryNavigation />}

      {/* モバイルでインラインヘッダーページの場合、ここでヘッダーを表示（自然なスクロールアウト） */}
      {!isEmbedded && !isPC && useInlineHeader && (
        <div className={marginClasses}>
          <Suspense fallback={null}>
            <HeaderNavigation fixed={false} />
          </Suspense>
        </div>
      )}

      {/* コンテンツエリア - iframe内またはbookmark-listではパディングなし */}
      <div className={`relative h-screen ${paddingClasses} ${marginClasses}`}>
        <div>
          <SearchUserModalWrapper />
          {children}
        </div>
      </div>

      {/* モバイル用ボトムナビゲーション - iframe内や特定のページでは非表示 */}
      {!isEmbedded &&
        !isPC &&
        !pathname?.startsWith('/setting') &&
        pathname !== '/bookmark-list' &&
        pathname !== '/callhistory-list' &&
        pathname !== '/block' &&
        pathname !== '/favorite-list' && <BottomNavigation />}
    </>
  );
}
