import {
  IconClipboard,
  IconCrown,
  IconHome,
  IconMessage,
  IconPhoto,
  IconShoppingBag,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useLocation } from '@tanstack/react-router';
// TODO: i18n - import { useTranslations } from '#/i18n';
import { useEffect, useState } from 'react';
import { CATEGORY_NAV_ITEMS } from '@/constants/categoryNavigation';
import {
  authPages,
  excludeNavbarPaths,
  publicExactPaths,
} from '@/constants/publicPaths';

const ICON_MAP = {
  home: IconHome,
  message: IconMessage,
  clipboard: IconClipboard,
  photo: IconPhoto,
  'shopping-bag': IconShoppingBag,
  crown: IconCrown,
} as const;

interface CategoryNavigationProps {
  showOnlyForProfile?: boolean;
}

export default function CategoryNavigation({
  showOnlyForProfile = false,
}: CategoryNavigationProps) {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const isActive = (path: string) => pathname === path;
  const [isEmbedded, setIsEmbedded] = useState(false);

  // クライアントサイドで埋め込みモードを検出
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsEmbedded(params.get('embedded') === 'true');
    }
  }, []);

  // 埋め込みモードの場合は非表示
  if (isEmbedded) {
    return null;
  }

  // 以下のページではナビゲーションバーを非表示にする：
  // - 認証関連ページ（ログイン・サインアップ等）
  // - 特定の公開ページ（利用規約・プライバシーポリシー等）
  // - ナビバー除外対象ページ（LP等）
  const isAuthPage = authPages.includes(pathname || '');
  const isExactPublicPath = publicExactPaths.includes(pathname || '');
  const isExcludeNavbarPath = excludeNavbarPaths.includes(pathname || '');

  // プロフィール専用モードの場合は、プロフィールページ以外では表示しない
  if (showOnlyForProfile) {
    const isProfilePage = pathname?.startsWith('/profile/unbroadcaster/');
    if (!isProfilePage) {
      return null;
    }
  }

  if (isAuthPage || isExactPublicPath || isExcludeNavbarPath) {
    return null;
  }

  return (
    <nav className="fixed top-[50px] z-40 w-full border-gray-200 border-b bg-gray-100 max-md:hidden">
      <div className="flex h-10 items-center overflow-x-auto bg-gray-100">
        {CATEGORY_NAV_ITEMS.map((item) => {
          const IconComponent = ICON_MAP[item.iconName];
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-full w-[150px] items-center justify-center gap-1.5 whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${
                isActive(item.href)
                  ? item.activeClass
                  : `border-transparent text-gray-700 ${item.hoverClass} bg-gray-100`
              }`}
            >
              <IconComponent size={18} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
