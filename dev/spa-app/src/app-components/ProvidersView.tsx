import dynamic from 'next/dynamic';
import { useLocation } from '@tanstack/react-router';
import { Suspense, useEffect, useState } from 'react';
import { isNativeApplication } from '@/constants/applicationId';
import { INLINE_HEADER_PAGES } from '@/constants/layout';
import { useIsEmbedded } from '@/hooks/useIsEmbedded';
import { locales } from '@/i18n/routing';
import { useUIStore } from '@/stores/uiStore';
import { HeaderVisibilityProvider } from './HeaderVisibilityContext';

// LPページ判定用のロケールパスSet（O(1)検索）
const localePathSet = new Set(locales.map((locale) => `/${locale}`));

// Recoilフックを使用するコンポーネントを動的インポートしてSSRを無効化
const AppToast = dynamic(() => import('@/components/AppToast'), {
  ssr: false,
  loading: () => null,
});

const CallSelectModal = dynamic(
  () => import('@/components/call/CallSelectModal'),
  {
    ssr: false,
    loading: () => null,
  },
);

const CallEndModal = dynamic(() => import('./CallEndModal'), {
  ssr: false,
  loading: () => null,
});

const HeaderNavigation = dynamic(() => import('./HeaderNavigation'), {
  ssr: false,
  loading: () => null,
});

export default function ProvidersView({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPC = useUIStore((s) => s.isPC);
  const setIsPC = useUIStore((s) => s.setIsPC);
  const isEmbedded = useIsEmbedded();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsPC(window.matchMedia('(min-width: 768px)').matches);
  }, [setIsPC]);

  // MainLayoutでヘッダーを表示するページかどうか
  const useInlineHeader = INLINE_HEADER_PAGES.some((page) =>
    pathname?.startsWith(page),
  );

  const isNativeSignup = pathname === '/signup' && isNativeApplication();
  // LPページ判定: ルートパス('/'), '/lp'で始まるパス, またはロケールのみのパス('/ja', '/en'など)
  const isLPPage =
    pathname === '/' ||
    pathname?.startsWith('/lp') ||
    (pathname !== null && localePathSet.has(pathname));
  const shouldHideByPath =
    isLPPage ||
    pathname?.startsWith('/message/') ||
    pathname?.startsWith('/incoming/') ||
    pathname?.startsWith('/outgoing/') ||
    pathname?.startsWith('/column') ||
    (!isPC && pathname?.startsWith('/profile/')) ||
    isNativeSignup;

  // PC版の足あとページでは、固定コンテナ内スクロールなのでヘッダーを常に表示
  const isFootprintListPC = pathname === '/footprint-list' && isPC;

  const shouldHideHeader = !isFootprintListPC && shouldHideByPath;

  // モバイルでインラインヘッダーページの場合、グローバルヘッダーを非表示
  const shouldHideGlobalHeader = !isPC && useInlineHeader;

  return (
    <HeaderVisibilityProvider isHeaderHidden={shouldHideHeader}>
      {isMounted && (
        <>
          <Suspense fallback={null}>
            <AppToast />
          </Suspense>
          {/* iframe内、特定のパス、またはインラインヘッダーページ（モバイル）ではグローバルヘッダーを非表示 */}
          {!isEmbedded &&
            !shouldHideByPath &&
            !isFootprintListPC &&
            !shouldHideGlobalHeader && (
              <Suspense fallback={null}>
                <HeaderNavigation />
              </Suspense>
            )}
          <Suspense fallback={null}>
            <CallSelectModal />
          </Suspense>
          <Suspense fallback={null}>
            <CallEndModal />
          </Suspense>
        </>
      )}
      {children}
    </HeaderVisibilityProvider>
  );
}
