import { create } from 'zustand';
import type { QuickJoinBookmarkStreamInfo } from '@/services/polling/types';

/**
 * 通話選択モーダルに渡すデータ
 * VideoTwoModal.tsx の型定義に合わせて拡張
 */
export type CallSelectModalData = {
  onClose: () => void;
  partnerId: string;
  userName: string;
  age: number;
  region: number | string;
  avatarId: string;
  about: string;
  isPurchased: boolean;
  isBonusCourseExist: boolean;
  videoCallWaiting: boolean;
  voiceCallWaiting: boolean;
  isLive?: boolean | undefined;
  liveScreenshotThumbnailId?: string | undefined;
  hasLovense?: boolean;
  bustSize?: string;
};

import type { MediaPermissionTarget } from '@/libs/nativeBridge';

/**
 * Native許可モーダルの状態
 */
export type NativePermissionModalState = {
  isOpen: boolean;
  deniedPermissions: MediaPermissionTarget[];
};

/**
 * UI状態管理（モーダル）
 */
type UIState = {
  // Modal states
  isCallSelectModalOpen: boolean;
  callSelectModalData: CallSelectModalData | null;
  isStopCallModalOpen: boolean;
  isRegisterModalOpen: boolean;
  isLoginModalOpen: boolean;
  isDeclinedLiveCall: boolean;
  /** お気に入り配信通知モーダル（nullの場合は非表示） */
  liveNotificationModalData: QuickJoinBookmarkStreamInfo | null;
  /** ユーザー検索モーダル */
  isSearchUserModalOpen: boolean;
  /** PWAインストールモーダル */
  isInstallModalShown: boolean;
  /** Native許可モーダル */
  nativePermissionModal: NativePermissionModalState;

  // Actions
  openCallSelectModal: (data: CallSelectModalData) => void;
  closeCallSelectModal: () => void;
  openStopCallModal: () => void;
  closeStopCallModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setIsDeclinedLiveCall: (declined: boolean) => void;
  /** お気に入り配信通知モーダルを開く */
  openLiveNotificationModal: (data: QuickJoinBookmarkStreamInfo) => void;
  /** お気に入り配信通知モーダルを閉じる */
  closeLiveNotificationModal: () => void;
  /** ユーザー検索モーダルを開く */
  openSearchUserModal: () => void;
  /** ユーザー検索モーダルを閉じる */
  closeSearchUserModal: () => void;
  /** ユーザー検索モーダルの表示状態を設定 */
  setIsSearchUserModalOpen: (isOpen: boolean) => void;
  /** PWAインストールモーダルを開く */
  openInstallModal: () => void;
  /** PWAインストールモーダルを閉じる */
  closeInstallModal: () => void;
  /** PWAインストールモーダルの表示状態を設定 */
  setIsInstallModalShown: (isShown: boolean) => void;
  /** Native許可モーダルを開く */
  openNativePermissionModal: (
    deniedPermissions: MediaPermissionTarget[],
  ) => void;
  /** Native許可モーダルを閉じる */
  closeNativePermissionModal: () => void;
  /** Native許可モーダルの状態を設定 */
  setNativePermissionModal: (state: NativePermissionModalState) => void;
  /** PC表示かどうか（アプリ起動時に一度だけ判定） */
  isPC: boolean;
  /** PC表示フラグを設定 */
  setIsPC: (v: boolean) => void;
};

/**
 * UIストア
 * モーダルの開閉状態を管理
 */
export const useUIStore = create<UIState>()((set) => ({
  // Initial state
  isCallSelectModalOpen: false,
  callSelectModalData: null,
  isStopCallModalOpen: false,
  isRegisterModalOpen: false,
  isLoginModalOpen: false,
  isDeclinedLiveCall: false,
  liveNotificationModalData: null,

  // Actions
  openCallSelectModal: (data) =>
    set({ isCallSelectModalOpen: true, callSelectModalData: data }),
  closeCallSelectModal: () =>
    set({ isCallSelectModalOpen: false, callSelectModalData: null }),
  openStopCallModal: () => set({ isStopCallModalOpen: true }),
  closeStopCallModal: () => set({ isStopCallModalOpen: false }),
  openRegisterModal: () => set({ isRegisterModalOpen: true }),
  closeRegisterModal: () => set({ isRegisterModalOpen: false }),
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  setIsDeclinedLiveCall: (declined) => set({ isDeclinedLiveCall: declined }),
  openLiveNotificationModal: (data) => set({ liveNotificationModalData: data }),
  closeLiveNotificationModal: () => set({ liveNotificationModalData: null }),

  // Search User Modal
  isSearchUserModalOpen: false,
  openSearchUserModal: () => set({ isSearchUserModalOpen: true }),
  closeSearchUserModal: () => set({ isSearchUserModalOpen: false }),
  setIsSearchUserModalOpen: (isOpen) => set({ isSearchUserModalOpen: isOpen }),

  // Install Modal
  isInstallModalShown: false,
  openInstallModal: () => set({ isInstallModalShown: true }),
  closeInstallModal: () => set({ isInstallModalShown: false }),
  setIsInstallModalShown: (isShown) => set({ isInstallModalShown: isShown }),

  // Native Permission Modal
  nativePermissionModal: { isOpen: false, deniedPermissions: [] },
  openNativePermissionModal: (deniedPermissions) =>
    set({ nativePermissionModal: { isOpen: true, deniedPermissions } }),
  closeNativePermissionModal: () =>
    set({ nativePermissionModal: { isOpen: false, deniedPermissions: [] } }),
  setNativePermissionModal: (state) => set({ nativePermissionModal: state }),

  // Responsive
  isPC: false,
  setIsPC: (v) => set({ isPC: v }),
}));
