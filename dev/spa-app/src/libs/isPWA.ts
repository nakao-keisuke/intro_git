export const isPWA = (): boolean => {
  if (typeof window === 'undefined') {
    // サーバーサイドレンダリング中は false を返す
    return false;
  }

  // ① standard な PWA 判定 (Chrome など)
  // fullscreenは除外（ブラウザのフルスクリーンモードと区別できないため）
  const isStandaloneDisplayMode =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches;

  // ② iOS Safari のホーム画面追加から起動時
  const isNavigatorStandalone = (window.navigator as any).standalone === true;

  return isStandaloneDisplayMode || isNavigatorStandalone;
};
