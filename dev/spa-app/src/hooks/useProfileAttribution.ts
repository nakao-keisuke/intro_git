import { useLocation } from '@tanstack/react-router';
import { useCallback } from 'react';
import type { SectionName } from '@/types/profileAttributionType';
import { setProfileAttribution } from '@/utils/profileAttribution';

/** プロフィール詳細トラッキングのデフォルト遷移元 */
const DEFAULT_PROFILE_SOURCE = '/girls/all';

/**
 * プロフィール詳細への遷移起点をクリック時に保存するフック
 * - 保存先: sessionStorage（TTL 30分）
 * - 保存内容: 現在のパス（例: "/girls/all"）
 */
export function useProfileAttribution() {
  const pathname = usePathname();

  const trackProfileIntent = useCallback(
    (sectionName?: SectionName) => {
      const sourcePath = pathname || DEFAULT_PROFILE_SOURCE;
      setProfileAttribution({
        source_path: sourcePath,
        section_name: sectionName,
      });
    },
    [pathname],
  );

  return { trackProfileIntent };
}
