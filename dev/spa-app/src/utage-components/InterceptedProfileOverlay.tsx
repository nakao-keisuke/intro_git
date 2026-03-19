import { useNavigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';

/**
 * インターセプトルートで表示されるフルスクリーンオーバーレイコンテナ
 *
 * 元のページの上にフルスクリーンで表示される。
 * layout.tsx で children の兄弟要素として配置されるため、
 * PullToRefresh の transform の影響を受けない。
 *
 * プロフィールページやメッセージページなど、
 * インターセプトルートで表示するコンテンツの共通ラッパーとして使用する。
 */
export default function InterceptedProfileOverlay({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  // ESC キーでオーバーレイを閉じる
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.back();
      }
    },
    [router],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    // オーバーレイ表示中は背面のスクロールを防止
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[1010] overflow-y-auto bg-white">
      {children}
    </div>
  );
}
