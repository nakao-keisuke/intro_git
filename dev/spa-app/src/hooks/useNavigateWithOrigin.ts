import { useNavigate } from '@tanstack/react-router';
import { useNavigationStore } from '@/features/navigation/store/navigationStore';
import type { NavOrigin, NavTo } from '@/types/navigation';
import { NavOriginKind } from '@/types/navigation';
import { parseNavTo } from '@/utils/parseNavTo';

const PENDING_KEY = 'pending-nav';

/**
 * ナビゲーション起点情報を付与した画面遷移を行うカスタムフック
 *
 * @example
 * const nav = useNavigateWithOrigin();
 *
 * // モーダルから遷移
 * nav.push("/purchase", nav.originFromModal("confirm-purchase"));
 *
 * // ヘッダーから遷移
 * nav.replace("/settings", nav.originFromHeader("settings-button"));
 *
 * // 通常のページから遷移
 * nav.push("/profile/123", nav.originFromPage());
 */
export function useNavigateWithOrigin() {
  const router = useRouter();
  const nav = useNavigationStore((s) => s.state);
  const updateNavigationState = useNavigationStore(
    (s) => s.updateNavigationState,
  );

  // 遷移元のフルパスを取得（最優先でRecoilに保持している最新のcurrentを利用）
  const getFromFull = (): string => {
    const cur = nav?.current;
    if (cur) return cur.fullPath ?? cur.pathname;
    try {
      if (typeof window !== 'undefined') {
        const { pathname, search } = window.location;
        return search ? `${pathname}${search}` : pathname;
      }
    } catch {}
    return '/girls/all'; // フォールバック
  };

  /**
   * モーダルからの遷移として記録
   */
  const originFromModal = (modalId: string): NavOrigin => ({
    kind: NavOriginKind.MODAL,
    modalId,
    inPath: getFromFull(),
  });

  /**
   * ヘッダーからの遷移として記録
   */
  const originFromHeader = (actionId: string): NavOrigin => ({
    kind: NavOriginKind.HEADER,
    actionId,
    inPath: getFromFull(),
  });

  /**
   * バナーからの遷移として記録
   */
  const originFromBanner = (bannerId: string): NavOrigin => ({
    kind: NavOriginKind.BANNER,
    bannerId,
    inPath: getFromFull(),
  });

  /**
   * 通常のページからの遷移として記録
   */
  const originFromPage = (): NavOrigin => ({
    kind: NavOriginKind.PAGE,
    path: getFromFull(),
  });

  /**
   * pending情報をZustandとsessionStorageに保存
   */
  const setPending = (origin: NavOrigin, to?: NavTo) => {
    const pending = {
      origin,
      ...(to && { to }),
    };
    // Zustandの状態を更新
    updateNavigationState({ pending });

    // sessionStorageにも保存（リロード対策）
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    } catch {
      // sessionStorage利用不可時は無視
    }
  };

  /**
   * router.pushをラップして起点情報を付与
   */
  const push = (toUrl: string, origin: NavOrigin) => {
    const to = parseNavTo(toUrl);
    setPending(origin, to);
    router.push(toUrl);
  };

  /**
   * router.replaceをラップして起点情報を付与
   */
  const replace = (toUrl: string, origin: NavOrigin) => {
    const to = parseNavTo(toUrl);
    setPending(origin, to);
    router.replace(toUrl);
  };

  return {
    push,
    replace,
    originFromModal,
    originFromHeader,
    originFromBanner,
    originFromPage,
  };
}
