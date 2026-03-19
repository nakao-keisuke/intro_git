import { useEffect, useRef } from 'react';
import { useNavigationStore } from '@/features/navigation/store/navigationStore';
import type { NavOrigin, NavTo } from '@/types/navigation';

const PENDING_KEY = 'pending-nav';

function readPending(): { origin: NavOrigin; to?: NavTo } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * 到達側ページで pending を確定して lastEntry に反映する軽量 Resolver。
 * - Zustand の navigationStore.state.lastEntry を更新
 * - sessionStorage の pending-nav を消去
 */
export default function PendingNavResolver() {
  const updateNavigationState = useNavigationStore(
    (s) => s.updateNavigationState,
  );
  const navState = useNavigationStore((s) => s.state);
  // React Strict Modeによる二重実行を防ぐためのフラグ
  const hasProcessed = useRef(false);

  useEffect(() => {
    // React Strict Modeによる二重実行を防ぐ
    if (hasProcessed.current) {
      return;
    }

    const pending = readPending();

    if (!pending) {
      return;
    }

    // 処理開始時点でフラグを立てる
    hasProcessed.current = true;

    const to: NavTo | undefined = pending.to;
    const origin: NavOrigin = pending.origin;

    if (to) {
      updateNavigationState({
        lastEntry: { to, origin },
        pending: null,
      });
    } else {
      updateNavigationState({
        lastEntry: navState.lastEntry ?? null,
        pending: null,
      });
    }

    try {
      sessionStorage.setItem('last-nav-entry', JSON.stringify({ to, origin }));
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      // ignore
    }
  }, [updateNavigationState, navState.lastEntry]);

  return null;
}
