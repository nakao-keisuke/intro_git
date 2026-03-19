import { create } from 'zustand';
import type { MyPageInitialData } from '@/services/my-page/type';

/**
 * マイページ状態管理ストア
 */
type MyPageState = {
  /** マイページ初期データ */
  initialData: MyPageInitialData | null;

  // Actions
  /** マイページ初期データを設定 */
  setInitialData: (data: MyPageInitialData | null) => void;
  /** マイページ初期データをクリア */
  clearInitialData: () => void;
};

export const useMyPageStore = create<MyPageState>((set) => ({
  // Initial state
  initialData: null,

  // Actions
  setInitialData: (data) => set({ initialData: data }),
  clearInitialData: () => set({ initialData: null }),
}));
