import { createContext, type ReactNode, useContext } from 'react';

/** ヘッダー表示状態の値型 */
export type HeaderVisibilityContextValue = {
  /** ヘッダーが非表示かどうか */
  isHeaderHidden: boolean;
};

const HeaderVisibilityContext = createContext<HeaderVisibilityContextValue>({
  isHeaderHidden: false,
});

/**
 * ヘッダーの表示状態をコンテキストで管理するプロバイダー
 * @param children - 子要素
 * @param isHeaderHidden - ヘッダーが非表示かどうか
 */
export function HeaderVisibilityProvider({
  children,
  isHeaderHidden,
}: {
  children: ReactNode;
  isHeaderHidden: boolean;
}) {
  return (
    <HeaderVisibilityContext.Provider value={{ isHeaderHidden }}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
}

/**
 * ヘッダーの表示状態を取得するカスタムフック
 * @returns ヘッダーの表示状態オブジェクト
 */
export const useHeaderVisibility = () => useContext(HeaderVisibilityContext);
