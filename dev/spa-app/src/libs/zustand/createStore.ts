import {
  create,
  type StateCreator,
  type StoreApi,
  type UseBoundStore,
} from 'zustand';
import { devtools } from 'zustand/middleware';

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

/**
 * 自動selector生成ユーティリティ
 *
 * @example
 * const useStore = createSelectors(create<State>()((set) => ({ ... })));
 * const value = useStore.use.someValue(); // 自動生成されたselector
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  store: S,
): WithSelectors<S> => {
  const storeWithSelectors = store as WithSelectors<S>;
  storeWithSelectors.use = {} as any;

  for (const key of Object.keys(store.getState())) {
    (storeWithSelectors.use as any)[key] = () => store((s) => (s as any)[key]);
  }

  return storeWithSelectors;
};

/**
 * 開発環境でのみdevtools有効化するストア作成ヘルパー
 *
 * @param initializer - Zustand state initializer
 * @param name - DevTools表示名
 * @returns セレクター付きZustandストア
 *
 * @example
 * export const useMyStore = createAppStore<MyState>(
 *   (set) => ({
 *     count: 0,
 *     increment: () => set((state) => ({ count: state.count + 1 })),
 *   }),
 *   'MyStore'
 * );
 */
export const createAppStore = <T extends object>(
  initializer: StateCreator<T>,
  name?: string,
) => {
  if (import.meta.env.NODE_ENV === 'development') {
    return createSelectors(
      create<T>()(devtools(initializer, { name: name ?? 'AppStore' })),
    );
  }
  return createSelectors(create<T>()(initializer));
};
