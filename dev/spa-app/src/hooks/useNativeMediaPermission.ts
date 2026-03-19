import { useCallback } from 'react';
import { isNativeApplication } from '@/constants/applicationId';
import { type MediaPermissionTarget, native } from '@/libs/nativeBridge';
import { useUIStore } from '@/stores/uiStore';
import {
  queryBrowserPermission,
  requestBrowserPermission,
} from '@/utils/browserPermission';

type CallType = 'video' | 'voice';

export const useNativeMediaPermission = () => {
  const modalState = useUIStore((s) => s.nativePermissionModal);
  const setModalState = useUIStore((s) => s.setNativePermissionModal);
  const isNativeApp = isNativeApplication();

  const checkAndRequestPermission = useCallback(
    async (callType: CallType): Promise<boolean> => {
      // Native環境: 既存のネイティブブリッジ経由チェック
      if (native.isInWebView()) {
        const targets: MediaPermissionTarget[] =
          callType === 'video' ? ['camera', 'microphone'] : ['microphone'];

        const deniedPermissions: MediaPermissionTarget[] = [];

        for (const target of targets) {
          const { result, error } = await native.checkPermission(target);

          if (error || !result) {
            console.error(
              `[useNativeMediaPermission] checkPermission failed for ${target}:`,
              error,
            );
            deniedPermissions.push(target);
            continue;
          }

          if (result.status === 'granted') continue;

          if (result.status === 'undetermined') {
            const { result: reqResult, error: reqError } =
              await native.requestPermission(target);

            if (reqError || !reqResult) {
              console.error(
                `[useNativeMediaPermission] requestPermission failed for ${target}:`,
                reqError,
              );
              deniedPermissions.push(target);
              continue;
            }

            if (reqResult.status === 'granted') continue;
            deniedPermissions.push(target);
          } else {
            deniedPermissions.push(target);
          }
        }

        if (deniedPermissions.length > 0) {
          setModalState({ isOpen: true, deniedPermissions });
          return false;
        }

        return true;
      }

      // ブラウザ環境: Permissions API + getUserMedia でチェック
      const targets: MediaPermissionTarget[] =
        callType === 'video' ? ['camera', 'microphone'] : ['microphone'];

      const deniedPermissions: MediaPermissionTarget[] = [];

      // 1. Permissions API で事前チェック（対応ブラウザのみ）
      for (const target of targets) {
        const status = await queryBrowserPermission(target);
        if (status === 'denied') {
          deniedPermissions.push(target);
        }
      }

      // 既に拒否されているパーミッションがある場合はモーダル表示
      if (deniedPermissions.length > 0) {
        setModalState({ isOpen: true, deniedPermissions });
        return false;
      }

      // 2. getUserMedia でブラウザプロンプトを表示
      const granted = await requestBrowserPermission(callType);
      if (!granted) {
        // 拒否された → どのパーミッションが拒否されたか再確認
        for (const target of targets) {
          const status = await queryBrowserPermission(target);
          if (status === 'denied') {
            deniedPermissions.push(target);
          }
        }
        // Permissions API 非対応（Safari等）で拒否されたがステータスを確認できない場合、
        // リクエストしたターゲットを全て拒否扱いにする
        if (deniedPermissions.length === 0) {
          deniedPermissions.push(...targets);
        }
        setModalState({ isOpen: true, deniedPermissions });
        return false;
      }

      return true;
    },
    [setModalState],
  );

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, deniedPermissions: [] });
  }, [setModalState]);

  const openSettings = useCallback(() => {
    if (native.isInWebView()) {
      native.openAppSettings();
    }
    // ブラウザ環境では設定画面を開けないのでモーダルを閉じるだけ
    closeModal();
  }, [closeModal]);

  return {
    checkAndRequestPermission,
    isPermissionModalOpen: modalState.isOpen,
    deniedPermissions: modalState.deniedPermissions,
    closePermissionModal: closeModal,
    openAppSettings: openSettings,
    isNativeApp,
  };
};
